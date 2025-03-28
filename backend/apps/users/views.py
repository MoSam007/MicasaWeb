from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
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
def update_user_role(request, uid):
    """Update a user's role (Admin only)"""
    if not request.user or not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(UserProfile, uid=uid)
    new_role = request.data.get('role', None)
    if new_role not in ['hunter', 'owner', 'mover', 'admin']:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

    user.role = new_role
    user.save()
    return Response({'message': 'User role updated successfully'}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
def toggle_user_status(request, uid):
    """Activate or deactivate a user account (Admin only)"""
    if not request.user or not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(UserProfile, uid=uid)
    user.is_active = not user.is_active
    user.save()
    return Response({'message': 'User status updated successfully'}, status=status.HTTP_200_OK)

@csrf_exempt
def get_user_info(request):
    """Retrieve authenticated user info"""
    if not request.user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    return JsonResponse({
        "uid": request.user.uid,
        "email": request.user.email,
        "name": request.user.username,
        "role": request.user.role,
    })
