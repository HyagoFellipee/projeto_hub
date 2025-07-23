from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import Cliente, CaixaPostal, Correspondencia, Contrato
from .serializers import (
    ClienteSerializer, CaixaPostalSerializer, CorrespondenciaSerializer,
    CorrespondenciaCreateSerializer, CorrespondenciaRetiradaSerializer,
    ContratoSerializer, DashboardSerializer
)


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Cliente.objects.all()
        ativo = self.request.query_params.get('ativo')
        tipo = self.request.query_params.get('tipo')
        search = self.request.query_params.get('search')
        
        if ativo is not None:
            queryset = queryset.filter(ativo=ativo.lower() == 'true')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) |
                Q(documento__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('nome')

    @action(detail=True, methods=['get'])
    def correspondencias(self, request, pk=None):
        cliente = self.get_object()
        try:
            caixa = cliente.caixa_postal
            correspondencias = caixa.correspondencias.all()
            serializer = CorrespondenciaSerializer(correspondencias, many=True)
            return Response(serializer.data)
        except CaixaPostal.DoesNotExist:
            return Response({'detail': 'Cliente não possui caixa postal.'}, 
                          status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def criar_caixa_postal(self, request, pk=None):
        cliente = self.get_object()
        if hasattr(cliente, 'caixa_postal'):
            return Response({'detail': 'Cliente já possui caixa postal.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        caixa = CaixaPostal.objects.create(cliente=cliente)
        serializer = CaixaPostalSerializer(caixa)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CaixaPostalViewSet(viewsets.ModelViewSet):
    queryset = CaixaPostal.objects.select_related('cliente').all()
    serializer_class = CaixaPostalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = CaixaPostal.objects.select_related('cliente').all()
        ativa = self.request.query_params.get('ativa')
        cliente_id = self.request.query_params.get('cliente_id')
        
        if ativa is not None:
            queryset = queryset.filter(ativa=ativa.lower() == 'true')
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        return queryset.order_by('numero')


class CorrespondenciaViewSet(viewsets.ModelViewSet):
    queryset = Correspondencia.objects.select_related('caixa_postal__cliente').all()
    serializer_class = CorrespondenciaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Correspondencia.objects.select_related('caixa_postal__cliente').all()
        cliente_id = self.request.query_params.get('cliente_id')
        caixa_id = self.request.query_params.get('caixa_id')
        status_param = self.request.query_params.get('status')
        tipo = self.request.query_params.get('tipo')
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        
        if cliente_id:
            queryset = queryset.filter(caixa_postal__cliente_id=cliente_id)
        if caixa_id:
            queryset = queryset.filter(caixa_postal_id=caixa_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if data_inicio:
            queryset = queryset.filter(data_recebimento__date__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_recebimento__date__lte=data_fim)
        
        return queryset.order_by('-data_recebimento')

    def get_serializer_class(self):
        if self.action == 'create':
            return CorrespondenciaCreateSerializer
        return CorrespondenciaSerializer

    @action(detail=True, methods=['post'])
    def marcar_retirada(self, request, pk=None):
        correspondencia = self.get_object()
        serializer = CorrespondenciaRetiradaSerializer(data=request.data)
        
        if serializer.is_valid():
            correspondencia.marcar_como_retirada(
                retirado_por=serializer.validated_data.get('retirado_por'),
                documento_retirada=serializer.validated_data.get('documento_retirada')
            )
            if serializer.validated_data.get('observacoes'):
                correspondencia.observacoes = serializer.validated_data['observacoes']
                correspondencia.save()
            
            response_serializer = CorrespondenciaSerializer(correspondencia)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pendentes(self, request):
        correspondencias = self.get_queryset().filter(status='RECEBIDA')
        serializer = self.get_serializer(correspondencias, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def hoje(self, request):
        hoje = timezone.now().date()
        correspondencias = self.get_queryset().filter(data_recebimento__date=hoje)
        serializer = self.get_serializer(correspondencias, many=True)
        return Response(serializer.data)


class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.select_related('cliente').all()
    serializer_class = ContratoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Contrato.objects.select_related('cliente').all()
        cliente_id = self.request.query_params.get('cliente_id')
        status_param = self.request.query_params.get('status')
        plano = self.request.query_params.get('plano')
        
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if plano:
            queryset = queryset.filter(plano=plano)
        
        return queryset.order_by('-data_inicio')

    @action(detail=False, methods=['get'])
    def vencidos(self, request):
        contratos = self.get_queryset().filter(
            data_inicio__lt=timezone.now().date(),
            status='ATIVO'
        )
        vencidos = [c for c in contratos if c.esta_vencido]
        serializer = self.get_serializer(vencidos, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        hoje = timezone.now().date()
        semana_passada = hoje - timedelta(days=7)
        
        total_clientes = Cliente.objects.filter(ativo=True).count()
        total_caixas_ativas = CaixaPostal.objects.filter(ativa=True).count()
        correspondencias_pendentes = Correspondencia.objects.filter(status='RECEBIDA').count()
        correspondencias_hoje = Correspondencia.objects.filter(
            data_recebimento__date=hoje
        ).count()
        correspondencias_ultimos_7_dias = Correspondencia.objects.filter(
            data_recebimento__date__gte=semana_passada
        ).count()
        clientes_ativos = Cliente.objects.filter(ativo=True).count()
        contratos_ativos = Contrato.objects.filter(status='ATIVO').count()
        
        correspondencias_por_tipo = dict(
            Correspondencia.objects.values('tipo').annotate(
                count=Count('tipo')
            ).values_list('tipo', 'count')
        )
        
        correspondencias_por_status = dict(
            Correspondencia.objects.values('status').annotate(
                count=Count('status')
            ).values_list('status', 'count')
        )
        
        data = {
            'total_clientes': total_clientes,
            'total_caixas_ativas': total_caixas_ativas,
            'correspondencias_pendentes': correspondencias_pendentes,
            'correspondencias_hoje': correspondencias_hoje,
            'correspondencias_ultimos_7_dias': correspondencias_ultimos_7_dias,
            'clientes_ativos': clientes_ativos,
            'contratos_ativos': contratos_ativos,
            'correspondencias_por_tipo': correspondencias_por_tipo,
            'correspondencias_por_status': correspondencias_por_status,
        }
        
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


class CorrespondenciasPorClienteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, cliente_id):
        try:
            cliente = Cliente.objects.get(id=cliente_id)
            caixa = cliente.caixa_postal
            correspondencias = caixa.correspondencias.all()
            
            status_param = request.query_params.get('status')
            if status_param:
                correspondencias = correspondencias.filter(status=status_param)
            
            serializer = CorrespondenciaSerializer(correspondencias, many=True)
            return Response(serializer.data)
        except Cliente.DoesNotExist:
            return Response({'detail': 'Cliente não encontrado.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        except CaixaPostal.DoesNotExist:
            return Response({'detail': 'Cliente não possui caixa postal.'}, 
                          status=status.HTTP_404_NOT_FOUND)


class MarcarCorrespondenciaRetiradaView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, correspondencia_id):
        try:
            correspondencia = Correspondencia.objects.get(id=correspondencia_id)
            serializer = CorrespondenciaRetiradaSerializer(data=request.data)
            
            if serializer.is_valid():
                correspondencia.marcar_como_retirada(
                    retirado_por=serializer.validated_data.get('retirado_por'),
                    documento_retirada=serializer.validated_data.get('documento_retirada')
                )
                
                response_serializer = CorrespondenciaSerializer(correspondencia)
                return Response(response_serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Correspondencia.DoesNotExist:
            return Response({'detail': 'Correspondência não encontrada.'}, 
                          status=status.HTTP_404_NOT_FOUND)


class RelatorioCorrespondenciasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        correspondencias = Correspondencia.objects.select_related(
            'caixa_postal__cliente'
        ).all()
        
        if data_inicio:
            correspondencias = correspondencias.filter(
                data_recebimento__date__gte=data_inicio
            )
        if data_fim:
            correspondencias = correspondencias.filter(
                data_recebimento__date__lte=data_fim
            )
        
        serializer = CorrespondenciaSerializer(correspondencias, many=True)
        return Response(serializer.data)