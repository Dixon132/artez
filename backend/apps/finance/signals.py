from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.orders.models import Order
from .models import Transaction

@receiver(post_save, sender=Order)
def create_transaction_on_production(sender, instance, created, **kwargs):
    transaction_exists = Transaction.objects.filter(order=instance, type='ingreso').exists()
    
    if not transaction_exists and instance.status in ['in_production', 'shipped', 'delivered']:
        Transaction.objects.create(
            type='ingreso',
            amount=instance.total_price,
            description=f"Venta - Orden #{instance.id} ({instance.full_name})",
            order=instance
        )
