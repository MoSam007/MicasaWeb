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
CLERK_ISSUER = os.environ.get('CLERK_ISSUER')  # Usually your Clerk frontend API URL

def verify_clerk_token(token):
    """Verify the Clerk JWT token and extract user info."""
    try:
        # Using the verification key for JWT validation
        # The key issue is here - Clerk tokens need specific audience and issuer settings
        # The "aud" claim should be set to match what Clerk sends
        payload = jwt.decode(
            token,
            CLERK_JWT_VERIFICATION_KEY,
            algorithms=["RS256"],
            options={"verify_signature": True},
            # Use a more flexible audience check - Clerk often uses the frontend URL as audience
            audience=[CLERK_ISSUER, "clerk", "https://blessed-meerkat-26.clerk.accounts.dev"],
            issuer=CLERK_ISSUER
        )
        return payload
    except jwt.InvalidTokenError as e:
        print(f"Token verification failed: {e}")
        return None

def get_user_from_clerk(user_id):
    """Fetch user details from Clerk API."""
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"https://api.clerk.dev/v1/users/{user_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
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
                    except User.DoesNotExist:
                        # Get user info from Clerk API
                        clerk_user = get_user_from_clerk(clerk_user_id)
                        
                        if clerk_user:
                            # Extract role from metadata
                            role = clerk_user.get('public_metadata', {}).get('role', 'hunter')
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
                            request.user = user
        
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