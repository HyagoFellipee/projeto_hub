from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Cliente, CaixaPostal, Correspondencia, Contrato


class ClienteSerializer(serializers.ModelSerializer):
    documento_formatado = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'tipo', 'nome', 'documento', 'documento_formatado',
            'email', 'telefone', 'endereco', 'ativo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(serializers.CharField)
    def get_documento_formatado(self, obj):
        return obj.documento_formatado

    def validate_documento(self, value):
        documento_limpo = ''.join(filter(str.isdigit, value))
        tipo = self.initial_data.get('tipo')
        
        if tipo == 'PF' and len(documento_limpo) != 11:
            raise serializers.ValidationError('CPF deve ter 11 dígitos.')
        elif tipo == 'PJ' and len(documento_limpo) != 14:
            raise serializers.ValidationError('CNPJ deve ter 14 dígitos.')
        
        return value


class CaixaPostalSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    cliente_documento = serializers.CharField(source='cliente.documento_formatado', read_only=True)
    total_correspondencias = serializers.SerializerMethodField()
    correspondencias_pendentes = serializers.SerializerMethodField()
    
    class Meta:
        model = CaixaPostal
        fields = [
            'id', 'numero', 'cliente', 'cliente_nome', 'cliente_documento',
            'observacoes', 'ativa', 'total_correspondencias', 
            'correspondencias_pendentes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    @extend_schema_field(serializers.IntegerField)
    def get_total_correspondencias(self, obj):
        return obj.correspondencias.count()

    @extend_schema_field(serializers.IntegerField)
    def get_correspondencias_pendentes(self, obj):
        return obj.correspondencias.filter(status='RECEBIDA').count()


class CorrespondenciaSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='caixa_postal.cliente.nome', read_only=True)
    caixa_numero = serializers.CharField(source='caixa_postal.numero', read_only=True)
    dias_na_caixa = serializers.SerializerMethodField()
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Correspondencia
        fields = [
            'id', 'caixa_postal', 'cliente_nome', 'caixa_numero',
            'data_recebimento', 'descricao', 'tipo', 'tipo_display',
            'status', 'status_display', 'data_retirada', 'remetente',
            'codigo_rastreamento', 'observacoes', 'retirado_por',
            'documento_retirada', 'dias_na_caixa', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(serializers.IntegerField)
    def get_dias_na_caixa(self, obj):
        return obj.dias_na_caixa

    def validate(self, data):
        if data.get('status') == 'RETIRADA' and not data.get('data_retirada'):
            from django.utils import timezone
            data['data_retirada'] = timezone.now()
        return data


class CorrespondenciaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Correspondencia
        fields = [
            'caixa_postal', 'data_recebimento', 'descricao', 'tipo',
            'remetente', 'codigo_rastreamento', 'observacoes'
        ]


class CorrespondenciaRetiradaSerializer(serializers.Serializer):
    retirado_por = serializers.CharField(max_length=255, required=False)
    documento_retirada = serializers.CharField(max_length=18, required=False)
    observacoes = serializers.CharField(required=False)


class ContratoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    data_vencimento = serializers.SerializerMethodField()
    esta_vencido = serializers.SerializerMethodField()
    valor_total = serializers.SerializerMethodField()
    plano_display = serializers.CharField(source='get_plano_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Contrato
        fields = [
            'id', 'cliente', 'cliente_nome', 'plano', 'plano_display',
            'valor_mensal', 'data_inicio', 'duracao_meses', 'data_vencimento',
            'status', 'status_display', 'esta_vencido', 'valor_total',
            'observacoes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(serializers.DateField)
    def get_data_vencimento(self, obj):
        return obj.data_vencimento

    @extend_schema_field(serializers.BooleanField)
    def get_esta_vencido(self, obj):
        return obj.esta_vencido

    @extend_schema_field(serializers.DecimalField(max_digits=12, decimal_places=2))
    def get_valor_total(self, obj):
        return obj.valor_total


class DashboardSerializer(serializers.Serializer):
    total_clientes = serializers.IntegerField()
    total_caixas_ativas = serializers.IntegerField()
    correspondencias_pendentes = serializers.IntegerField()
    correspondencias_hoje = serializers.IntegerField()
    correspondencias_ultimos_7_dias = serializers.IntegerField()
    clientes_ativos = serializers.IntegerField()
    contratos_ativos = serializers.IntegerField()
    correspondencias_por_tipo = serializers.DictField()
    correspondencias_por_status = serializers.DictField()