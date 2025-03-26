import firebase_admin
from firebase_admin import auth
from django.http import JsonResponse

class FirebaseAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            id_token = auth_header.split("Bearer ")[1]
            try:
                decoded_token = auth.verify_id_token(id_token)
                request.user = decoded_token  # Attach user data to request
            except Exception:
                return JsonResponse({"message": "Invalid authentication"}, status=401)
        return self.get_response(request)
