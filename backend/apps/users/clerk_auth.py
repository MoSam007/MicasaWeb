import os
import jwt
import requests
from functools import wraps
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

CLERK_API_KEY = os.environ.get('CLERK_API_KEY')
CLERK_JWT_VERIFICATION_KEY = os.environ.get('CLERK_JWT_VERIFICATION_KEY')
CLERK_ISSUER = os.environ.get('CLERK_ISSUER')

def update_clerk_user_metadata(user_id, metadata):
    """Update user metadata in Clerk"""
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.patch(
            f"https://api.clerk.dev/v1/users/{user_id}",
            headers=headers,
            json={"public_metadata": metadata}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to update user metadata: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error updating user metadata: {e}")
        return None

def verify_clerk_token(token):
    """Verify the Clerk JWT token and extract user info."""
    try:
        print(f"Verifying Clerk token with issuer: {CLERK_ISSUER}")
        
        # First, decode without verification to see what's in the token
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        print(f"Token payload (unverified): {unverified_payload}")
        
        # Get the actual issuer and audience from the token
        token_issuer = unverified_payload.get('iss')
        token_audience = unverified_payload.get('aud')
        
        print(f"Token issuer: {token_issuer}")
        print(f"Token audience: {token_audience}")
        
        # Verify the token with the correct audience
        payload = jwt.decode(
            token,
            CLERK_JWT_VERIFICATION_KEY,
            algorithms=["RS256"],
            options={"verify_signature": True, "verify_aud": True},
            audience=token_audience if token_audience else [
                CLERK_ISSUER,
                f"{CLERK_ISSUER}",
                "clerk",
                "https://blessed-meerkat-26.clerk.accounts.dev"
            ],
            issuer=token_issuer if token_issuer else CLERK_ISSUER
        )
        
        print(f"Token verified successfully: {payload}")
        return payload
        
    except jwt.ExpiredSignatureError:
        print("Token verification failed: Token has expired")
        return None
    except jwt.InvalidAudienceError as e:
        print(f"Token verification failed: Invalid audience - {e}")
        return None
    except jwt.InvalidIssuerError as e:
        print(f"Token verification failed: Invalid issuer - {e}")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Token verification failed: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error verifying token: {e}")
        return None

def get_user_from_clerk(user_id):
    """Fetch user details from Clerk API."""
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"https://api.clerk.dev/v1/users/{user_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch user from Clerk API: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching user from Clerk API: {e}")
        return None

def clerk_auth_middleware(get_response):
    """Middleware to authenticate requests using Clerk tokens."""
    def middleware(request):
        # Skip auth for paths that don't need it
        if request.path.startswith('/admin/') or request.path.startswith('/api/public/'):
            return get_response(request)
        
        # Extract the token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
            
            # Verify the token
            payload = verify_clerk_token(token)
            if payload:
                # Extract user ID from payload
                clerk_user_id = payload.get('sub')
                
                if clerk_user_id:
                    # Try to find user in database
                    try:
                        user = User.objects.get(uid=clerk_user_id)
                        # Set user in request
                        request.user = user
                        
                        # Also store token payload for role-specific access
                        request.clerk_payload = payload
                        
                    except User.DoesNotExist:
                        # Get user info from Clerk API
                        clerk_user = get_user_from_clerk(clerk_user_id)
                        
                        if clerk_user:
                            # Extract role from JWT metadata first, then from public_metadata
                            role = payload.get('metadata', {}).get('role', 'user')
                            if not role or role == 'user':
                                role = clerk_user.get('public_metadata', {}).get('role', 'user')
                            
                            email = clerk_user.get('email_addresses', [{}])[0].get('email_address', '')
                            username = email.split('@')[0] if email else clerk_user_id[:8]
                            
                            # Create user in your database
                            user = User.objects.create(
                                uid=clerk_user_id,
                                email=email,
                                username=username,
                                role=role,
                                is_active=True
                            )
                            
                            # Update Clerk metadata with role-specific ID
                            role_metadata = clerk_user.get('public_metadata', {})
                            role_metadata['role'] = role
                            
                            # Set role-specific ID based on user's role
                            if role == 'owner':
                                role_metadata['owner_id'] = clerk_user_id
                            elif role == 'hunter':
                                role_metadata['hunter_id'] = clerk_user_id
                            elif role == 'mover':
                                role_metadata['mover_id'] = clerk_user_id
                            
                            # Update Clerk with the new metadata
                            update_clerk_user_metadata(clerk_user_id, role_metadata)
                            
                            request.user = user
                            request.clerk_payload = payload
        
        return get_response(request)
    
    return middleware

def clerk_auth_required(view_func):
    """Decorator to require Clerk authentication for views."""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user or not hasattr(request.user, 'uid'):
            return JsonResponse({"error": "Authentication required"}, status=401)
        return view_func(request, *args, **kwargs)
    
    return wrapped_view

def require_role(allowed_roles):
    """Decorator to require specific roles for views."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user or not hasattr(request.user, 'uid'):
                return JsonResponse({"error": "Authentication required"}, status=401)
            
            if request.user.role not in allowed_roles:
                return JsonResponse({"error": "Insufficient permissions"}, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator