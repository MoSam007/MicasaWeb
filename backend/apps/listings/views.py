from rest_framework.generics import ListAPIView
from .models import Listing
from .serializers import ListingSerializer

class ListingListView(ListAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
