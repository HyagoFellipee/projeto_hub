# Generated by Django 4.2.7 on 2025-07-23 13:40

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CaixaPostal',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('numero', models.CharField(max_length=20, unique=True, verbose_name='Número da Caixa')),
                ('observacoes', models.TextField(blank=True, null=True, verbose_name='Observações')),
                ('ativa', models.BooleanField(default=True, verbose_name='Caixa Ativa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criada em')),
            ],
            options={
                'verbose_name': 'Caixa Postal',
                'verbose_name_plural': 'Caixas Postais',
                'ordering': ['numero'],
            },
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo', models.CharField(choices=[('PF', 'Pessoa Física'), ('PJ', 'Pessoa Jurídica')], max_length=2, verbose_name='Tipo de Pessoa')),
                ('nome', models.CharField(max_length=255, verbose_name='Nome/Razão Social')),
                ('documento', models.CharField(max_length=18, unique=True, validators=[django.core.validators.RegexValidator(message='Documento deve conter apenas números, pontos, hífens e barras.', regex='^[\\d\\.\\-\\/]+$')], verbose_name='CPF/CNPJ')),
                ('email', models.EmailField(max_length=254, verbose_name='E-mail')),
                ('telefone', models.CharField(blank=True, max_length=20, null=True, validators=[django.core.validators.RegexValidator(message='Número de telefone deve ter entre 9 e 15 dígitos.', regex='^\\+?1?\\d{9,15}$')], verbose_name='Telefone')),
                ('endereco', models.TextField(blank=True, null=True, verbose_name='Endereço')),
                ('ativo', models.BooleanField(default=True, verbose_name='Cliente Ativo')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
            ],
            options={
                'verbose_name': 'Cliente',
                'verbose_name_plural': 'Clientes',
                'ordering': ['nome'],
            },
        ),
        migrations.CreateModel(
            name='Correspondencia',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('data_recebimento', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Data de Recebimento')),
                ('descricao', models.TextField(verbose_name='Descrição')),
                ('tipo', models.CharField(choices=[('CARTA', 'Carta'), ('PACOTE', 'Pacote'), ('AR', 'Aviso de Recebimento'), ('SEDEX', 'Sedex'), ('PAC', 'PAC'), ('ENCOMENDA', 'Encomenda'), ('DOCUMENTO', 'Documento'), ('OUTRO', 'Outro')], max_length=15, verbose_name='Tipo')),
                ('status', models.CharField(choices=[('RECEBIDA', 'Recebida'), ('RETIRADA', 'Retirada'), ('DEVOLVIDA', 'Devolvida')], default='RECEBIDA', max_length=15, verbose_name='Status')),
                ('data_retirada', models.DateTimeField(blank=True, null=True, verbose_name='Data de Retirada')),
                ('remetente', models.CharField(blank=True, max_length=255, null=True, verbose_name='Remetente')),
                ('codigo_rastreamento', models.CharField(blank=True, max_length=50, null=True, verbose_name='Código de Rastreamento')),
                ('observacoes', models.TextField(blank=True, null=True, verbose_name='Observações')),
                ('retirado_por', models.CharField(blank=True, max_length=255, null=True, verbose_name='Retirado por')),
                ('documento_retirada', models.CharField(blank=True, max_length=18, null=True, verbose_name='Documento de quem retirou')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('caixa_postal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='correspondencias', to='core.caixapostal', verbose_name='Caixa Postal')),
            ],
            options={
                'verbose_name': 'Correspondência',
                'verbose_name_plural': 'Correspondências',
                'ordering': ['-data_recebimento'],
            },
        ),
        migrations.CreateModel(
            name='Contrato',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('plano', models.CharField(choices=[('BASICO', 'Básico'), ('PREMIUM', 'Premium'), ('EMPRESARIAL', 'Empresarial')], max_length=20, verbose_name='Plano')),
                ('valor_mensal', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Valor Mensal')),
                ('data_inicio', models.DateField(verbose_name='Data de Início')),
                ('duracao_meses', models.PositiveIntegerField(verbose_name='Duração (meses)')),
                ('status', models.CharField(choices=[('ATIVO', 'Ativo'), ('VENCIDO', 'Vencido'), ('CANCELADO', 'Cancelado'), ('SUSPENSO', 'Suspenso')], default='ATIVO', max_length=15, verbose_name='Status')),
                ('observacoes', models.TextField(blank=True, null=True, verbose_name='Observações')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contratos', to='core.cliente', verbose_name='Cliente')),
            ],
            options={
                'verbose_name': 'Contrato',
                'verbose_name_plural': 'Contratos',
                'ordering': ['-data_inicio'],
            },
        ),
        migrations.AddField(
            model_name='caixapostal',
            name='cliente',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='caixa_postal', to='core.cliente', verbose_name='Cliente'),
        ),
    ]
