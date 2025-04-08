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
@firebase_auth_required
def update_user_role(request):
    """Update user role"""
    user = request.user
    new_role = request.data.get('role')
    
    if new_role and new_role in ['hunter', 'owner', 'mover', 'admin']:
        user.role = new_role
        user.save()
        
        # Update role in Firebase
        # try:
        #     from firebase_admin import auth
        #     auth.set_custom_user_claims(user.uid, {'role': new_role})
        # except Exception as e:
        #     return Response({'error': f'Firebase update failed: {e}'}, status=400)
            
        # return Response({'success': True, 'role': new_role})
   
    # Try to mirror in Firebase custom claims, but don’t fail if it errors
        try:
            from firebase_admin import auth
            auth.set_custom_user_claims(user.uid, {'role': new_role})
        except Exception:
            pass
        return Response({'success': True, 'role': new_role})
    return Response({'error': 'Invalid role'}, status=400)

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