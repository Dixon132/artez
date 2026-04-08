from django.db import models

# Create your models here.
from django.db import models


class Customer(models.Model):
    email = models.EmailField()
    name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address_line = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.city}, {self.country}"