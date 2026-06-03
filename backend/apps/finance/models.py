from django.db import models
from apps.orders.models import Order

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
    ]

    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_display()} - ${self.amount} - {self.description}"
