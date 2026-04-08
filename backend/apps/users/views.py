from rest_framework.viewsets import ModelViewSet
from .models import Customer, Address
from .serializers import CustomerSerializer, AddressSerializer


class CustomerViewSet(ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class AddressViewSet(ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
