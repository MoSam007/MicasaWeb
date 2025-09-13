# import firebase_admin
# from firebase_admin import auth, credentials
# from django.conf import settings
# from django.http import JsonResponse
# from django.utils.functional import SimpleLazyObject
# from django.contrib.auth.middleware import get_user
# from .models import UserProfile

# All Firebase Auth logic is now disabled. This file is kept for reference only.

# The following code is commented out to prevent SyntaxError and runtime errors.
# if not firebase_admin._apps:
#     cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
#     firebase_admin.initialize_app(cred)

# def verify_firebase_token(id_token):
#     """Verifies Firebase ID token and returns user."""
#     try:
#         print(f"Verifying Firebase token: {id_token[:10]}...")
#         decoded_token = auth.verify_id_token(id_token)
#         uid = decoded_token.get("uid")
#         email = decoded_token.get("email")
#         
#         # Get role from custom claims - check multiple possible locations
#         role = None
#         
#         # 1. Look for role directly in claims
#         if "role" in decoded_token:
#             role = decoded_token.get("role")
#             print(f"Found role in root claims: {role}")
#             
#         # 2. Check for role in the standard claims field
#         elif "claims" in decoded_token and isinstance(decoded_token["claims"], dict):
#             claims_dict = decoded_token.get("claims", {})
#             if "role" in claims_dict:
#                 role = claims_dict.get("role")
#                 print(f"Found role in claims dict: {role}")
#                 
#         print(f"Token decoded - UID: {uid}, Email: {email}, Role from claims: {role}")
#         
#         # Try to find existing user in database
#         try:
#             print(f"Looking up user with UID: {uid}")
#             user = UserProfile.objects.get(uid=uid)
#             
#             if user:
#                 print(f"Found existing user: {email} with role: {user.role}")
#                 
#                 # If we have a role from claims and it differs from DB, update DB
#                 if role and user.role != role:
#                     print(f"Updating user role from {user.role} to {role} (from token claims)")
#                     user.role = role
#                     user.save()
#                 # If we have a role in DB but not in claims, use the DB role
#                 # and don't override it with default
#                 elif user.role and not role:
#                     role = user.role
#                     print(f"Using role from database: {role}")
#         except UserProfile.DoesNotExist:
#             user = None
#         
#         # If still no role, default to 'hunter'
#         if not role:
#             role = "hunter"  # Default role
#             print(f"No role found, defaulting to: {role}")
# 
#         # Create user if doesn't exist
#         if not user:
#             user = UserProfile.objects.create(
#                 uid=uid,
#                 email=email,
#                 role=role,
#                 username=email.split('@')[0] if email else uid[:8],
#                 is_active=True
#             )
#             print(f"Created new user: {email} with role: {role}")
#             
#             # Set Firebase custom claims for new users
#             try:
#                 print(f"Setting initial Firebase claims for {email} with role: {role}")
#                 auth.set_custom_user_claims(uid, {'role': role})
#             except Exception as e:
#                 print(f"Failed to set initial Firebase claims: {e}")
#         
#         # Always ensure that user has the correct role property
#         # regardless of where we got it from
#         user.role = role
#         
#         return user
#     except Exception as e:
#         print(f"Firebase token verification error: {e}")
#         return None

# def firebase_auth_required(view_func):
#     """Decorator to enforce Firebase authentication."""
#     def wrapper(request, *args, **kwargs):
#         id_token = request.headers.get("Authorization")
#         if id_token and id_token.startswith("Bearer "):
#             id_token = id_token.split("Bearer ")[1]
#             user = verify_firebase_token(id_token)
#             if user:
#                 request.user = SimpleLazyObject(lambda: user)
#                 return view_func(request, *args, **kwargs)
#         return JsonResponse({"error": "Unauthorized"}, status=401)
#     return wrapper

# def firebase_auth_middleware(get_response):
#     """
#     Middleware to authenticate requests using Firebase ID tokens.
#     """
#     def middleware(request):
#         # Bypass Firebase authentication for Django Admin
#         if request.path.startswith("/admin/"):
#             request.user = get_user(request)
#             return get_response(request)
#         id_token = request.headers.get("Authorization")
#         if id_token and id_token.startswith("Bearer "):
#             id_token = id_token.split("Bearer ")[1]
#             user = verify_firebase_token(id_token)
#             if user:
#                 request.user = SimpleLazyObject(lambda: user)
#             else:
#                 return JsonResponse({"error": "Invalid Firebase Token"}, status=401)
#         else:
#             request.user = None
#         return get_response(request)
#     return middleware