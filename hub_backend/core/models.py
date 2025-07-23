from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid


class Cliente(models.Model):
    TIPO_CHOICES = [
        ('PF', 'Pessoa Física'),
        ('PJ', 'Pessoa Jurídica'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tipo = models.CharField(max_length=2, choices=TIPO_CHOICES, verbose_name='Tipo de Pessoa')
    nome = models.CharField(max_length=255, verbose_name='Nome/Razão Social')
    documento = models.CharField(
        max_length=18, 
        unique=True,
        verbose_name='CPF/CNPJ',
        validators=[
            RegexValidator(
                regex=r'^[\d\.\-\/]+$',
                message='Documento deve conter apenas números, pontos, hífens e barras.'
            )
        ]
    )
    email = models.EmailField(verbose_name='E-mail')
    telefone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        verbose_name='Telefone',
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Número de telefone deve ter entre 9 e 15 dígitos.'
            )
        ]
    )
    endereco = models.TextField(blank=True, null=True, verbose_name='Endereço')
    ativo = models.BooleanField(default=True, verbose_name='Cliente Ativo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.documento}"

    def clean(self):
        documento_limpo = ''.join(filter(str.isdigit, self.documento))
        
        if self.tipo == 'PF':
            if len(documento_limpo) != 11:
                raise ValidationError({'documento': 'CPF deve ter 11 dígitos.'})
        elif self.tipo == 'PJ':
            if len(documento_limpo) != 14:
                raise ValidationError({'documento': 'CNPJ deve ter 14 dígitos.'})

    @property
    def documento_formatado(self):
        documento_limpo = ''.join(filter(str.isdigit, self.documento))
        
        if self.tipo == 'PF' and len(documento_limpo) == 11:
            return f"{documento_limpo[:3]}.{documento_limpo[3:6]}.{documento_limpo[6:9]}-{documento_limpo[9:]}"
        elif self.tipo == 'PJ' and len(documento_limpo) == 14:
            return f"{documento_limpo[:2]}.{documento_limpo[2:5]}.{documento_limpo[5:8]}/{documento_limpo[8:12]}-{documento_limpo[12:]}"
        
        return self.documento


class CaixaPostal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero = models.CharField(max_length=20, unique=True, verbose_name='Número da Caixa')
    cliente = models.OneToOneField(
        Cliente, 
        on_delete=models.CASCADE, 
        related_name='caixa_postal',
        verbose_name='Cliente'
    )
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    ativa = models.BooleanField(default=True, verbose_name='Caixa Ativa')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criada em')

    class Meta:
        verbose_name = 'Caixa Postal'
        verbose_name_plural = 'Caixas Postais'
        ordering = ['numero']

    def __str__(self):
        return f"Caixa {self.numero} - {self.cliente.nome}"

    def save(self, *args, **kwargs):
        if not self.numero:
            ultimo_numero = CaixaPostal.objects.filter(
                numero__regex=r'^\d+$'
            ).order_by('-numero').first()
            
            if ultimo_numero:
                try:
                    proximo_numero = int(ultimo_numero.numero) + 1
                except ValueError:
                    proximo_numero = 1
            else:
                proximo_numero = 1
                
            self.numero = str(proximo_numero).zfill(4)
        
        super().save(*args, **kwargs)


class Correspondencia(models.Model):
    TIPO_CHOICES = [
        ('CARTA', 'Carta'),
        ('PACOTE', 'Pacote'),
        ('AR', 'Aviso de Recebimento'),
        ('SEDEX', 'Sedex'),
        ('PAC', 'PAC'),
        ('ENCOMENDA', 'Encomenda'),
        ('DOCUMENTO', 'Documento'),
        ('OUTRO', 'Outro'),
    ]
    
    STATUS_CHOICES = [
        ('RECEBIDA', 'Recebida'),
        ('RETIRADA', 'Retirada'),
        ('DEVOLVIDA', 'Devolvida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    caixa_postal = models.ForeignKey(
        CaixaPostal, 
        on_delete=models.CASCADE, 
        related_name='correspondencias',
        verbose_name='Caixa Postal'
    )
    data_recebimento = models.DateTimeField(default=timezone.now, verbose_name='Data de Recebimento')
    descricao = models.TextField(verbose_name='Descrição')
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES, verbose_name='Tipo')
    status = models.CharField(
        max_length=15, 
        choices=STATUS_CHOICES, 
        default='RECEBIDA',
        verbose_name='Status'
    )
    data_retirada = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='Data de Retirada'
    )
    remetente = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name='Remetente'
    )
    codigo_rastreamento = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        verbose_name='Código de Rastreamento'
    )
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    retirado_por = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name='Retirado por'
    )
    documento_retirada = models.CharField(
        max_length=18, 
        blank=True, 
        null=True,
        verbose_name='Documento de quem retirou'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Correspondência'
        verbose_name_plural = 'Correspondências'
        ordering = ['-data_recebimento']

    def __str__(self):
        return f"{self.tipo} - {self.caixa_postal.cliente.nome} - {self.data_recebimento.strftime('%d/%m/%Y')}"

    def marcar_como_retirada(self, retirado_por=None, documento_retirada=None):
        self.status = 'RETIRADA'
        self.data_retirada = timezone.now()
        if retirado_por:
            self.retirado_por = retirado_por
        if documento_retirada:
            self.documento_retirada = documento_retirada
        self.save()

    @property
    def dias_na_caixa(self):
        if self.status == 'RETIRADA':
            return (self.data_retirada - self.data_recebimento).days
        return (timezone.now() - self.data_recebimento).days

    @property
    def cliente(self):
        return self.caixa_postal.cliente


class Contrato(models.Model):
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('VENCIDO', 'Vencido'),
        ('CANCELADO', 'Cancelado'),
        ('SUSPENSO', 'Suspenso'),
    ]
    
    PLANO_CHOICES = [
        ('BASICO', 'Básico'),
        ('PREMIUM', 'Premium'),
        ('EMPRESARIAL', 'Empresarial'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cliente = models.ForeignKey(
        Cliente, 
        on_delete=models.CASCADE, 
        related_name='contratos',
        verbose_name='Cliente'
    )
    plano = models.CharField(max_length=20, choices=PLANO_CHOICES, verbose_name='Plano')
    valor_mensal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor Mensal')
    data_inicio = models.DateField(verbose_name='Data de Início')
    duracao_meses = models.PositiveIntegerField(verbose_name='Duração (meses)')
    status = models.CharField(
        max_length=15, 
        choices=STATUS_CHOICES, 
        default='ATIVO',
        verbose_name='Status'
    )
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Contrato'
        verbose_name_plural = 'Contratos'
        ordering = ['-data_inicio']

    def __str__(self):
        return f"{self.cliente.nome} - {self.plano} - {self.status}"

    @property
    def data_vencimento(self):
        from dateutil.relativedelta import relativedelta
        return self.data_inicio + relativedelta(months=self.duracao_meses)

    @property
    def esta_vencido(self):
        return timezone.now().date() > self.data_vencimento

    @property
    def valor_total(self):
        return self.valor_mensal * self.duracao_meses