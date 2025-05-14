from django.test import TestCase
from django.contrib.auth.models import User
from .models import Profile

class ProfileTestCase(TestCase):
    def setUp(self):
        user = User.objects.create(username='testuser')
        Profile.objects.create(user=user, phone_number='123456789')

    def test_profile_creation(self):
        profile = Profile.objects.get(user__username='testuser')
        self.assertEqual(profile.phone_number, '123456789')
