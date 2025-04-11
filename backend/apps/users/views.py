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
    """Update user role"""
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
                firebase_auth.set_custom_user_claims(uid, {'role': new_role})
                print(f"Updated Firebase role for {email} to {new_role}")
            except Exception as e:
                print(f"Firebase update failed: {e}")
                
            return Response({'success': True, 'role': new_role})
            
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
            
            user, created = UserProfile.objects.get_or_create(
                uid=uid,
                defaults={
                    "email": email,
                    "role": role,
                    "username": email.split('@')[0] if email else uid[:8],
                    "is_active": True
                }
            )
            
            # Update role if user exists
            if not created and user.role != role:
                user.role = role
                user.save()
                
            # Set Firebase custom claims for role
            try:
                firebase_auth.set_custom_user_claims(uid, {'role': role})
                print(f"Set Firebase role for {email} to {role}")
            except Exception as e:
                print(f"Firebase custom claims update failed: {e}")
                
            serializer = UserSerializer(user)
            return Response(serializer.data)
            
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