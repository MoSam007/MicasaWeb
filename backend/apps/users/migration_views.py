import csv
import io
import json
import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .models import UserProfile
from .firebase_auth import firebase_auth_required
from firebase_admin import auth as firebase_auth

@api_view(['POST'])
@firebase_auth_required  # Only allow admin users with Firebase auth during migration
def export_users_for_clerk(request):
    """
    Export users from the database to a CSV format that can be imported into Clerk.
    This endpoint is admin-only and is used during the migration process.
    """
    # Check if user is admin
    if not request.user or not request.user.is_admin:
        return Response({"error": "Admin access required"}, status=403)
    
    # Get all active users
    users = UserProfile.objects.filter(is_active=True)
    
    # Create CSV file in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV header - these are the fields Clerk expects
    writer.writerow([
        'email_address', 
        'username', 
        'first_name', 
        'last_name', 
        'public_metadata',
        'private_metadata'
    ])
    
    # Write user data
    for user in users:
        # Convert role to Clerk metadata JSON format
        public_metadata = json.dumps({"role": user.role})
        private_metadata = json.dumps({})
        
        # Parse name parts
        first_name = user.first_name if user.first_name else ''
        last_name = user.last_name if user.last_name else ''
        
        writer.writerow([
            user.email,
            user.username,
            first_name,
            last_name,
            public_metadata,
            private_metadata
        ])
    
    # Create response with CSV file
    response = HttpResponse(output.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="users_for_clerk_import.csv"'
    
    return response

@api_view(['POST'])
@firebase_auth_required  # Admin only during migration
def migrate_user_to_clerk(request):
    """
    Migrate a single user from Firebase to Clerk.
    This endpoint creates the user in Clerk and updates the UID in the database.
    """
    # Check if user is admin
    if not request.user or not request.user.is_admin:
        return Response({"error": "Admin access required"}, status=403)
    
    # Get user ID to migrate
    firebase_uid = request.data.get('firebase_uid')
    if not firebase_uid:
        return Response({"error": "Firebase UID is required"}, status=400)
    
    try:
        # Get user from database
        user = UserProfile.objects.get(uid=firebase_uid)
        
        # Create user in Clerk - this would normally be done through Clerk's API
        # For this example, we'll just show what would be sent to Clerk
        clerk_user_data = {
            "email_address": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "public_metadata": {"role": user.role},
            "password": "temporary_password"  # In a real implementation, you'd use a secure random password
        }
        
        # In production, you would make an API call to Clerk to create the user
        # Then update the user's UID in your database with the new Clerk UID
        
        # For now, let's just return what would be sent to Clerk
        return Response({
            "status": "Would migrate user to Clerk",
            "user_data": clerk_user_data,
            "note": "In a real implementation, this would create the user in Clerk and update the UID in the database"
        })
        
    except UserProfile.DoesNotExist:
        return Response({"error": f"User with Firebase UID {firebase_uid} not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@firebase_auth_required  # Admin only during migration
def update_user_clerk_uid(request):
    """
    Update a user's UID in the database after they've been migrated to Clerk.
    This is used to link existing database records to new Clerk users.
    """
    # Check if user is admin
    if not request.user or not request.user.is_admin:
        return Response({"error": "Admin access required"}, status=403)
    
    # Get user IDs
    firebase_uid = request.data.get('firebase_uid')
    clerk_uid = request.data.get('clerk_uid')
    
    if not firebase_uid or not clerk_uid:
        return Response({"error": "Both Firebase UID and Clerk UID are required"}, status=400)
    
    try:
        # Get user from database by Firebase UID
        user = UserProfile.objects.get(uid=firebase_uid)
        
        # Update UID to Clerk UID
        user.uid = clerk_uid
        user.save()
        
        return Response({
            "status": "success",
            "message": f"User {user.email} migrated from Firebase UID {firebase_uid} to Clerk UID {clerk_uid}"
        })
        
    except UserProfile.DoesNotExist:
        return Response({"error": f"User with Firebase UID {firebase_uid} not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)