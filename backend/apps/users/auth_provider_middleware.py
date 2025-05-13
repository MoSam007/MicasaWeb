from django.http import JsonResponse

def auth_provider_middleware(get_response):
    """
    Middleware to select the appropriate authentication provider based on request headers.
    This allows supporting both Firebase and Clerk during the migration period.
    """
    def middleware(request):
        # Get the authentication provider from header
        auth_provider = request.headers.get('X-Auth-Provider', '').lower()
        
        # Skip auth for paths that don't need it
        if request.path.startswith('/admin/') or request.path.startswith('/api/public/'):
            return get_response(request)
        
        # Get the Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            # No token provided
            request.user = None
            return get_response(request)
            
        # Extract token
        token = auth_header.split('Bearer ')[1]
        
        # Based on the provider header, choose the appropriate auth method
        if auth_provider == 'clerk':
            # Use Clerk authentication
            from .clerk_auth import verify_clerk_token, get_user_from_clerk
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            # Verify Clerk token
            payload = verify_clerk_token(token)
            if payload:
                clerk_user_id = payload.get('sub')
                
                if clerk_user_id:
                    # Try to find user in database
                    try:
                        user = User.objects.get(uid=clerk_user_id)
                        request.user = user
                    except User.DoesNotExist:
                        # Get user info from Clerk
                        clerk_user = get_user_from_clerk(clerk_user_id)
                        
                        if clerk_user:
                            # Extract role from metadata
                            role = clerk_user.get('public_metadata', {}).get('role', 'hunter')
                            email = clerk_user.get('email_addresses', [{}])[0].get('email_address', '')
                            username = email.split('@')[0] if email else clerk_user_id[:8]
                            
                            # Create user in database
                            user = User.objects.create(
                                uid=clerk_user_id,
                                email=email,
                                username=username,
                                role=role,
                                is_active=True
                            )
                            request.user = user
            else:
                return JsonResponse({"error": "Invalid Clerk token"}, status=401)
                
        else:
            # Default to Firebase authentication
            from .firebase_auth import verify_firebase_token
            
            user = verify_firebase_token(token)
            if user:
                request.user = user
            else:
                return JsonResponse({"error": "Invalid Firebase token"}, status=401)
        
        return get_response(request)
    
    return middleware