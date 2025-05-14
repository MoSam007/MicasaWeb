from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserSerializer
from .clerk_auth import clerk_auth_required, verify_clerk_token, get_user_from_clerk

@api_view(['GET'])
@clerk_auth_required
def get_clerk_user_info(request):
    """Get current Clerk user info including role"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
def create_clerk_user(request):
    """Register a new user from Clerk authentication"""
    id_token = request.headers.get("Authorization")
    if id_token and id_token.startswith("Bearer "):
        id_token = id_token.split("Bearer ")[1]
        
        try:
            # Verify the Clerk token
            payload = verify_clerk_token(id_token)
            if not payload:
                return Response({"error": "Invalid token"}, status=401)
                
            clerk_user_id = payload.get('sub')
            # Get additional user data from request body
            role = request.data.get("role", "hunter")
            
            if not role or role not in ['hunter', 'owner', 'mover', 'admin']:
                return Response({'error': 'Invalid role'}, status=400)
                
            # Get user details from Clerk API
            clerk_user = get_user_from_clerk(clerk_user_id)
            if not clerk_user:
                return Response({"error": "Could not fetch user details from Clerk"}, status=400)
                
            email = clerk_user.get('email_addresses', [{}])[0].get('email_address', '')
            username = email.split('@')[0] if email else clerk_user_id[:8]
            
            # Create or update user in database
            user, created = UserProfile.objects.update_or_create(
                uid=clerk_user_id,
                defaults={
                    "email": email,
                    "username": username,
                    "role": role,
                    "is_active": True
                }
            )
            
            serializer = UserSerializer(user)
            return Response(serializer.data)
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    
    return Response({"error": "Invalid token"}, status=401)

@api_view(['PUT'])
def update_clerk_user_role(request):
    """Update a Clerk user's role"""
    id_token = request.headers.get("Authorization")
    if id_token and id_token.startswith("Bearer "):
        id_token = id_token.split("Bearer ")[1]
        
        try:
            # Verify the Clerk token
            payload = verify_clerk_token(id_token)
            if not payload:
                return Response({"error": "Invalid token"}, status=401)
                
            clerk_user_id = payload.get('sub')
            new_role = request.data.get('role')
            
            if not new_role or new_role not in ['hunter', 'owner', 'mover', 'admin']:
                return Response({'error': 'Invalid role'}, status=400)
            
            # Check if the user exists
            try:
                user = UserProfile.objects.get(uid=clerk_user_id)
                
                # Only admins or users without a role should be able to change roles
                # This is to prevent users from freely changing roles after registration
                if user.role != 'admin' and user.role and user.role != new_role:
                    return Response({'error': 'You cannot change your role after registration'}, status=403)
                    
                # Update user role
                user.role = new_role
                user.save()
                
            except UserProfile.DoesNotExist:
                # User doesn't exist yet, create them with the specified role
                clerk_user = get_user_from_clerk(clerk_user_id)
                if not clerk_user:
                    return Response({"error": "Could not fetch user details from Clerk"}, status=400)
                    
                email = clerk_user.get('email_addresses', [{}])[0].get('email_address', '')
                username = email.split('@')[0] if email else clerk_user_id[:8]
                
                user = UserProfile.objects.create(
                    uid=clerk_user_id,
                    email=email,
                    username=username,
                    role=new_role,
                    is_active=True
                )
            
            serializer = UserSerializer(user)
            return Response({
                **serializer.data,
                'message': 'Role updated successfully'
            })
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    
    return Response({"error": "Invalid token"}, status=401)