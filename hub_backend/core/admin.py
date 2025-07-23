from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Cliente, CaixaPostal, Correspondencia, Contrato


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'documento_formatado', 'email', 'ativo', 'created_at']
    list_filter = ['tipo', 'ativo', 'created_at']
    search_fields = ['nome', 'documento', 'email']
    list_editable = ['ativo']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tipo', 'nome', 'documento', 'email')
        }),
        ('Contato', {
            'fields': ('telefone', 'endereco')
        }),
        ('Status', {
            'fields': ('ativo',)
        }),
        ('Metadados', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def documento_formatado(self, obj):
        return obj.documento_formatado
    documento_formatado.short_description = 'Documento'


@admin.register(CaixaPostal)
class CaixaPostalAdmin(admin.ModelAdmin):
    list_display = ['numero', 'cliente_nome', 'cliente_documento', 'ativa', 'total_correspondencias', 'created_at']
    list_filter = ['ativa', 'created_at']
    search_fields = ['numero', 'cliente__nome', 'cliente__documento']
    list_editable = ['ativa']
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Informações da Caixa', {
            'fields': ('numero', 'cliente', 'observacoes')
        }),
        ('Status', {
            'fields': ('ativa',)
        }),
        ('Metadados', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def cliente_nome(self, obj):
        return obj.cliente.nome
    cliente_nome.short_description = 'Cliente'

    def cliente_documento(self, obj):
        return obj.cliente.documento_formatado
    cliente_documento.short_description = 'Documento'

    def total_correspondencias(self, obj):
        total = obj.correspondencias.count()
        pendentes = obj.correspondencias.filter(status='RECEBIDA').count()
        
        if total > 0:
            url = reverse('admin:core_correspondencia_changelist') + f'?caixa_postal__id__exact={obj.id}'
            return format_html(
                '<a href="{}">{} total ({} pendentes)</a>',
                url, total, pendentes
            )
        return "0"
    total_correspondencias.short_description = 'Correspondências'


@admin.register(Correspondencia)
class CorrespondenciaAdmin(admin.ModelAdmin):
    list_display = [
        'descricao_curta', 'tipo', 'cliente_nome', 'caixa_numero', 
        'status', 'data_recebimento', 'dias_na_caixa_display'
    ]
    list_filter = ['tipo', 'status', 'data_recebimento', 'caixa_postal__cliente__tipo']
    search_fields = [
        'descricao', 'remetente', 'codigo_rastreamento',
        'caixa_postal__numero', 'caixa_postal__cliente__nome'
    ]
    list_editable = ['status']
    readonly_fields = ['id', 'dias_na_caixa', 'created_at', 'updated_at']
    date_hierarchy = 'data_recebimento'
    
    fieldsets = (
        ('Informações da Correspondência', {
            'fields': ('caixa_postal', 'tipo', 'descricao', 'remetente', 'codigo_rastreamento')
        }),
        ('Datas', {
            'fields': ('data_recebimento', 'data_retirada')
        }),
        ('Status e Retirada', {
            'fields': ('status', 'retirado_por', 'documento_retirada')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Metadados', {
            'fields': ('id', 'dias_na_caixa', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def descricao_curta(self, obj):
        return obj.descricao[:50] + '...' if len(obj.descricao) > 50 else obj.descricao
    descricao_curta.short_description = 'Descrição'

    def cliente_nome(self, obj):
        return obj.caixa_postal.cliente.nome
    cliente_nome.short_description = 'Cliente'

    def caixa_numero(self, obj):
        return obj.caixa_postal.numero
    caixa_numero.short_description = 'Caixa'

    def status_colorido(self, obj):
        colors = {
            'RECEBIDA': 'orange',
            'RETIRADA': 'green',
            'DEVOLVIDA': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colorido.short_description = 'Status'

    def dias_na_caixa_display(self, obj):
        dias = obj.dias_na_caixa
        if obj.status == 'RECEBIDA' and dias > 30:
            return format_html('<span style="color: red; font-weight: bold;">{} dias</span>', dias)
        elif obj.status == 'RECEBIDA' and dias > 15:
            return format_html('<span style="color: orange; font-weight: bold;">{} dias</span>', dias)
        return f"{dias} dias"
    dias_na_caixa_display.short_description = 'Dias na Caixa'

    actions = ['marcar_como_retirada', 'marcar_como_recebida']

    def marcar_como_retirada(self, request, queryset):
        updated = queryset.update(status='RETIRADA', data_retirada=timezone.now())
        self.message_user(request, f'{updated} correspondências marcadas como retiradas.')
    marcar_como_retirada.short_description = "Marcar como retirada"

    def marcar_como_recebida(self, request, queryset):
        updated = queryset.update(status='RECEBIDA', data_retirada=None)
        self.message_user(request, f'{updated} correspondências marcadas como recebidas.')
    marcar_como_recebida.short_description = "Marcar como recebida"


@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    list_display = [
        'cliente_nome', 'plano', 'valor_mensal', 'data_inicio', 
        'data_vencimento_display', 'status', 'valor_total'
    ]
    list_filter = ['plano', 'status', 'data_inicio']
    search_fields = ['cliente__nome', 'cliente__documento']
    list_editable = ['status']
    readonly_fields = ['id', 'data_vencimento', 'esta_vencido', 'valor_total', 'created_at', 'updated_at']
    date_hierarchy = 'data_inicio'
    
    fieldsets = (
        ('Cliente', {
            'fields': ('cliente',)
        }),
        ('Contrato', {
            'fields': ('plano', 'valor_mensal', 'data_inicio', 'duracao_meses')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Cálculos', {
            'fields': ('data_vencimento', 'esta_vencido', 'valor_total'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def cliente_nome(self, obj):
        return obj.cliente.nome
    cliente_nome.short_description = 'Cliente'

    def data_vencimento_display(self, obj):
        data = obj.data_vencimento
        if obj.esta_vencido:
            return format_html('<span style="color: red; font-weight: bold;">{}</span>', data.strftime('%d/%m/%Y'))
        return data.strftime('%d/%m/%Y')
    data_vencimento_display.short_description = 'Vencimento'

    def status_colorido(self, obj):
        colors = {
            'ATIVO': 'green',
            'VENCIDO': 'red',
            'CANCELADO': 'gray',
            'SUSPENSO': 'orange',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colorido.short_description = 'Status'


admin.site.site_header = 'HUB - Sistema de Correspondências'
admin.site.site_title = 'HUB Admin'
admin.site.index_title = 'Painel de Administração'