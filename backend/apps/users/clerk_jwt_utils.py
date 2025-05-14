import os
import jwt
from django.conf import settings

# Get environment variables or settings
CLERK_JWT_VERIFICATION_KEY = os.environ.get('CLERK_JWT_VERIFICATION_KEY', getattr(settings, 'CLERK_JWT_VERIFICATION_KEY', None))
CLERK_ISSUER = os.environ.get('CLERK_ISSUER', getattr(settings, 'CLERK_ISSUER', None))

class ClerkJWTVerifier:
    """Helper class for Clerk JWT verification operations"""
    
    @staticmethod
    def verify_token(token):
        """
        Verify a Clerk JWT token
        
        Args:
            token (str): JWT token string
            
        Returns:
            dict: Decoded token payload if valid, None otherwise
        """
        if not CLERK_JWT_VERIFICATION_KEY:
            raise ValueError("CLERK_JWT_VERIFICATION_KEY is not configured")
            
        if not CLERK_ISSUER:
            raise ValueError("CLERK_ISSUER is not configured")
            
        try:
            # Using the verification key for JWT validation
            payload = jwt.decode(
                token,
                CLERK_JWT_VERIFICATION_KEY,
                algorithms=["RS256"],
                options={"verify_signature": True},
                audience="clerk",
                issuer=CLERK_ISSUER
            )
            
            # Verify required claims
            if not payload.get('sub'):
                print("Invalid token: Missing 'sub' claim")
                return None
                
            return payload
            
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
            return None
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    @staticmethod
    def extract_user_id(payload):
        """Extract the Clerk user ID from token payload"""
        return payload.get('sub') if payload else None