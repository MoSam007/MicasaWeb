import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.http import JsonResponse

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    """
    Verifies the Firebase ID token and returns user details if valid.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role", "user")  # Assuming role is stored in Firebase claims
        }
    except Exception as e:
        return None

def firebase_auth_middleware(get_response):
    """
    Middleware to authenticate requests using Firebase ID tokens.
    """
    def middleware(request):
        id_token = request.headers.get("Authorization")
        if id_token and id_token.startswith("Bearer "):
            id_token = id_token.split("Bearer ")[1]
            user_info = verify_firebase_token(id_token)
            if user_info:
                request.user_info = user_info
            else:
                return JsonResponse({"error": "Invalid Firebase Token"}, status=401)
        else:
            request.user_info = None
        
        return get_response(request)
    
    return middleware
