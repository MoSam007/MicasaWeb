import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.http import JsonResponse
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.middleware import get_user
from .models import UserProfile

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    """Verifies Firebase ID token and returns user."""
    try:
        print(f"Verifying Firebase token: {id_token[:10]}...")
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        
        # Get role from custom claims
        role = decoded_token.get("role")
        
        print(f"Token decoded - UID: {uid}, Email: {email}, Role from claims: {role}")
        
        # If no role in claims, default to 'hunter'
        if not role:
            role = "hunter"  # Default role
            print(f"No role in claims, defaulting to: {role}")

        print(f"Looking up user with UID: {uid}")
        user, created = UserProfile.objects.get_or_create(
            uid=uid,
            defaults={
                "email": email,
                "role": role,
                "username": email.split('@')[0] if email else uid[:8],
                "is_active": True
            }
        )

        if created:
            print(f"Created new user: {email} with role: {role}")
        else:
            print(f"Found existing user: {email} with role: {user.role}")
            
        # Update role if user exists but role has changed
        if not created and role and user.role != role:
            print(f"Updating role for {email} from {user.role} to {role}")
            user.role = role
            user.save()
            
        return user
    except Exception as e:
        print(f"Firebase token verification error: {e}")
        return None

def firebase_auth_required(view_func):
    """Decorator to enforce Firebase authentication."""
    def wrapper(request, *args, **kwargs):
        id_token = request.headers.get("Authorization")
        if id_token and id_token.startswith("Bearer "):
            id_token = id_token.split("Bearer ")[1]
            user = verify_firebase_token(id_token)
            if user:
                request.user = SimpleLazyObject(lambda: user)
                return view_func(request, *args, **kwargs)
        return JsonResponse({"error": "Unauthorized"}, status=401)
    return wrapper

def firebase_auth_middleware(get_response):
    """
    Middleware to authenticate requests using Firebase ID tokens.
    """
    def middleware(request):
                # Bypass Firebase authentication for Django Admin
        if request.path.startswith("/admin/"):
            request.user = get_user(request)
            return get_response(request)
        
        id_token = request.headers.get("Authorization")
        if id_token and id_token.startswith("Bearer "):
            id_token = id_token.split("Bearer ")[1]
            user = verify_firebase_token(id_token)
            if user:
                request.user = SimpleLazyObject(lambda: user)
            else:
                return JsonResponse({"error": "Invalid Firebase Token"}, status=401)
        else:
            request.user = None
        
        return get_response(request)
    
    return middleware
