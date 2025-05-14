import json
import csv
import argparse
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import UserProfile

class Command(BaseCommand):
    help = 'Migrates users from Firebase to Clerk'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            choices=['export', 'prepare-import', 'update-uids'],
            required=True,
            help='Action to perform'
        )
        parser.add_argument(
            '--input-file',
            help='Input file for update-uids action'
        )
        parser.add_argument(
            '--output-file',
            help='Output file for export or prepare-import actions'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'export':
            self.export_users_to_csv(options['output_file'])
        elif action == 'prepare-import':
            self.prepare_import_file(options['output_file'])
        elif action == 'update-uids':
            self.update_user_uids(options['input_file'])
    
    def export_users_to_csv(self, output_file):
        """Export users from Django to CSV format for Clerk import"""
        if not output_file:
            output_file = 'users_for_clerk_import.csv'
        
        users = UserProfile.objects.filter(is_active=True)
        count = users.count()
        
        with open(output_file, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # Write header
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
                private_metadata = json.dumps({"firebase_uid": user.uid})
                
                writer.writerow([
                    user.email,
                    user.username,
                    user.first_name or '',
                    user.last_name or '',
                    public_metadata,
                    private_metadata
                ])
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully exported {count} users to {output_file}')
        )
    
    def prepare_import_file(self, output_file):
        """Create a file with instructions for importing users to Clerk"""
        if not output_file:
            output_file = 'clerk_import_instructions.md'
        
        instructions = """# Instructions for importing users to Clerk

## Step 1: Import users from CSV

1. Log in to your Clerk Dashboard
2. Go to Users > Import
3. Upload the CSV file you generated with `python manage.py migrate_users --action=export`
4. Follow Clerk's import wizard

## Step 2: Create migration mapping file

After importing users to Clerk, you need to create a mapping file with Firebase UIDs and new Clerk UIDs.
You can do this by:

1. Exporting users from Clerk (Users > Export)
2. Creating a CSV file with the following columns: firebase_uid, clerk_uid
3. Run the update-uids command:
   ```
   python manage.py migrate_users --action=update-uids --input-file=mapping.csv
   ```

## Sample mapping file format:

```
firebase_uid,clerk_uid
FIREBASE_UID_1,CLERK_USER_ID_1
FIREBASE_UID_2,CLERK_USER_ID_2
```

## Notes:

- Passwords cannot be migrated. Users will need to use the password reset flow.
- The private_metadata field will contain the original Firebase UID.
- You can use the Clerk API to extract this information and create your mapping file.
"""
        
        with open(output_file, 'w') as f:
            f.write(instructions)
        
        self.stdout.write(
            self.style.SUCCESS(f'Instructions written to {output_file}')
        )
    
    def update_user_uids(self, input_file):
        """Update user UIDs from Firebase to Clerk"""
        if not input_file:
            self.stdout.write(
                self.style.ERROR('Input file is required for update-uids action')
            )
            return
        
        updated_count = 0
        error_count = 0
        
        with open(input_file, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                firebase_uid = row.get('firebase_uid')
                clerk_uid = row.get('clerk_uid')
                
                if not firebase_uid or not clerk_uid:
                    self.stdout.write(
                        self.style.WARNING(f'Skipping row: Missing required fields: {row}')
                    )
                    error_count += 1
                    continue
                
                try:
                    user = UserProfile.objects.get(uid=firebase_uid)
                    user.uid = clerk_uid
                    user.save()
                    updated_count += 1
                except UserProfile.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'User with Firebase UID {firebase_uid} not found')
                    )
                    error_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Updated {updated_count} users, {error_count} errors'))