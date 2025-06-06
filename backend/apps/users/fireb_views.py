from firebase_admin import auth as firebase_auth
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .firebase_auth import firebase_auth_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile
from .serializers import UserSerializer

@api_view(['GET'])
def get_user_profile(request, uid):
    """Fetch a user profile by Firebase UID"""
    user = get_object_or_404(UserProfile, uid=uid)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@firebase_auth_required
def get_user_info(request):
    """Get current user info including role"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
def update_user_role(request):
    """
    Update user role - allows users to update their own role
    or admin to update any user's role
    """
    id_token = request.headers.get("Authorization")
    if id_token and id_token.startswith("Bearer "):
        id_token = id_token.split("Bearer ")[1]
        
        try:
            # Verify token directly without requiring existing user
            decoded_token = firebase_auth.verify_id_token(id_token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email", "")
            new_role = request.data.get('role')
            
            if not new_role or new_role not in ['hunter', 'owner', 'mover', 'admin']:
                return Response({'error': 'Invalid role'}, status=400)
            
            # Check if current user has permission to change role
            try:
                # Try to find the user first
                user = UserProfile.objects.get(uid=uid)
                
                # Only admins should be able to change their role directly
                if user.role != 'admin' and user.role != new_role:
                    # For normal users, only allow role change if they don't have a role yet
                    # or if they're updating to the same role they already have
                    return Response({'error': 'You cannot change your role after registration'}, status=403)
                
            except UserProfile.DoesNotExist:
                # New user - allow role selection during initial creation
                pass
                
            # Get or create user
            user, created = UserProfile.objects.update_or_create(
                uid=uid,
                defaults={
                    "email": email,
                    "role": new_role,
                    "username": email.split('@')[0] if email else uid[:8],
                    "is_active": True
                }
            )
            
            # Update Firebase custom claims
            try:
                # CRITICAL: Set all claims in one operation - don't just add the role
                firebase_auth.set_custom_user_claims(uid, {'role': new_role})
                # Force token refresh in the response
                print(f"Updated Firebase role for {email} to {new_role}")
                return Response({
                    'success': True, 
                    'role': new_role,
                    'forceRefresh': True  # Signal to the client to force refresh token
                })
            except Exception as e:
                print(f"Firebase update failed: {e}")
                return Response({"error": f"Firebase claims update failed: {str(e)}"}, status=500)
                
        except Exception as e:
            print(f"Error updating role: {e}")
            return Response({"error": str(e)}, status=400)
            
    return Response({"error": "Invalid token"}, status=401)

@api_view(['POST'])
def create_user(request):
    """Create a new user with Firebase token and role"""
    id_token = request.headers.get("Authorization")
    if id_token and id_token.startswith("Bearer "):
        id_token = id_token.split("Bearer ")[1]
        
        try:
            # Verify the token but don't require an existing user
            decoded_token = firebase_auth.verify_id_token(id_token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            role = request.data.get("role", "hunter")  # Get role from request
            
            if not role or role not in ['hunter', 'owner', 'mover', 'admin']:
                return Response({'error': 'Invalid role'}, status=400)
                
            user, created = UserProfile.objects.get_or_create(
                uid=uid,
                defaults={
                    "email": email,
                    "role": role,
                    "username": email.split('@')[0] if email else uid[:8],
                    "is_active": True
                }
            )
            
            # If user already exists, don't change their role
            # This prevents role tampering during login
            if not created:
                role = user.role  # Use the existing role from database
                
            # Set Firebase custom claims for role
            try:
                firebase_auth.set_custom_user_claims(uid, {'role': role})
                print(f"Set Firebase role for {email} to {role}")
                
                # Return a signal to force token refresh
                serializer = UserSerializer(user)
                return Response({
                    **serializer.data,
                    'forceRefresh': True
                })
            except Exception as e:
                print(f"Firebase custom claims update failed: {e}")
                return Response({
                    "error": f"Firebase claims update failed: {str(e)}",
                    **UserSerializer(user).data
                }, status=206)  # Partial Content
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    
    return Response({"error": "Invalid token"}, status=401)


@api_view(['PATCH'])
def update_user(request, uid):
    """Update user profile details"""
    if not request.user or request.user.uid != uid and not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(UserProfile, uid=uid)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def toggle_user_status(request, uid):
    """Activate or deactivate a user account (Admin only)"""
    if not request.user or not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(UserProfile, uid=uid)
    user.is_active = not user.is_active
    user.save()
    return Response({'message': 'User status updated successfully'}, status=status.HTTP_200_OK)