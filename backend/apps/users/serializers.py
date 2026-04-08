from rest_framework import serializers
from .models import Customer, Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'country', 'city', 'address_line', 'postal_code']

class CustomerSerializer(serializers.ModelSerializer):
    # Relacionar direcciones con el cliente
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'email', 'name', 'created_at', 'addresses']
    