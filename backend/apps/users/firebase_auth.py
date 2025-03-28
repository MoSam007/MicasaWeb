import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.http import JsonResponse
from django.utils.functional import SimpleLazyObject
from .models import UserProfile

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    """Verifies Firebase ID token and returns user."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        role = decoded_token.get("role", "hunter")  # Default role

        user, _ = UserProfile.objects.get_or_create(uid=uid, defaults={"email": email, "role": role})
        return user
    except Exception:
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
