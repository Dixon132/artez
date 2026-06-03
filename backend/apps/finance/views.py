from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type']
    search_fields = ['description']
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        ingresos = Transaction.objects.filter(type='ingreso').aggregate(total=Sum('amount'))['total'] or 0
        egresos = Transaction.objects.filter(type='egreso').aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'ingresos': float(ingresos),
            'egresos': float(egresos),
            'balance': float(ingresos - egresos)
        })
    
    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        period = request.query_params.get('period', 'month')
        
        if period == 'week':
            days = 7
        elif period == 'year':
            days = 365
        else:
            days = 30
        
        start_date = datetime.now() - timedelta(days=days)
        
        ingresos = Transaction.objects.filter(
            type='ingreso',
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Sum('amount')
        ).order_by('date')
        
        egresos = Transaction.objects.filter(
            type='egreso',
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Sum('amount')
        ).order_by('date')
        
        return Response({
            'ingresos': [{'date': str(i['date']), 'total': float(i['total'])} for i in ingresos],
            'egresos': [{'date': str(e['date']), 'total': float(e['total'])} for e in egresos]
        })
