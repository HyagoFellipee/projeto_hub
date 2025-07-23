from django.core.management.base import BaseCommand
from core.models import Cliente, CaixaPostal, Correspondencia, Contrato
from django.utils import timezone
from datetime import timedelta, date
import random
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Correspondencia.objects.all().delete()
            Contrato.objects.all().delete()
            CaixaPostal.objects.all().delete()
            Cliente.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Data cleared!'))

        # Dados de clientes
        clientes_data = [
            {
                'tipo': 'PF',
                'nome': 'João Silva Santos',
                'documento': '12345678901',
                'email': 'joao.silva@email.com',
                'telefone': '11987654321',
                'endereco': 'Rua das Flores, 123 - São Paulo, SP'
            },
            {
                'tipo': 'PF',
                'nome': 'Maria Oliveira Costa',
                'documento': '98765432100',
                'email': 'maria.oliveira@email.com',
                'telefone': '11876543210',
                'endereco': 'Av. Paulista, 456 - São Paulo, SP'
            },
            {
                'tipo': 'PF',
                'nome': 'Carlos Eduardo Ferreira',
                'documento': '11122233344',
                'email': 'carlos.ferreira@email.com',
                'telefone': '11765432109',
                'endereco': 'Rua Augusta, 789 - São Paulo, SP'
            },
            {
                'tipo': 'PJ',
                'nome': 'Tech Solutions Ltda',
                'documento': '12345678000123',
                'email': 'contato@techsolutions.com.br',
                'telefone': '1133334444',
                'endereco': 'Av. Faria Lima, 1000 - São Paulo, SP'
            },
            {
                'tipo': 'PJ',
                'nome': 'Comércio Brasil S.A.',
                'documento': '98765432000187',
                'email': 'admin@comerciobrasil.com.br',
                'telefone': '1155556666',
                'endereco': 'Rua do Comércio, 500 - São Paulo, SP'
            },
            {
                'tipo': 'PF',
                'nome': 'Ana Paula Rodrigues',
                'documento': '33344455566',
                'email': 'ana.rodrigues@email.com',
                'telefone': '11654321098',
                'endereco': 'Rua da Consolação, 200 - São Paulo, SP'
            },
        ]

        # Criar clientes
        clientes_criados = []
        for data in clientes_data:
            cliente, created = Cliente.objects.get_or_create(
                documento=data['documento'],
                defaults=data
            )
            if created:
                self.stdout.write(f'✓ Cliente criado: {cliente.nome}')
            else:
                self.stdout.write(f'- Cliente já existe: {cliente.nome}')
            clientes_criados.append(cliente)

        # Criar caixas postais e correspondências
        tipos_correspondencia = ['CARTA', 'PACOTE', 'AR', 'SEDEX', 'PAC', 'ENCOMENDA', 'DOCUMENTO']
        remetentes = [
            'Correios',
            'Amazon',
            'Magazine Luiza',
            'Banco do Brasil',
            'Receita Federal',
            'INSS',
            'Mercado Livre',
            'Tribunal de Justiça',
            'OLX',
            'Shopee',
            'Casas Bahia',
            'Prefeitura Municipal',
        ]

        for cliente in clientes_criados:
            # Criar caixa postal
            caixa, created = CaixaPostal.objects.get_or_create(
                cliente=cliente,
                defaults={'observacoes': f'Caixa postal do cliente {cliente.nome}'}
            )
            if created:
                self.stdout.write(f'✓ Caixa postal criada: {caixa.numero}')

            # Criar correspondências
            num_correspondencias = random.randint(3, 8)
            for i in range(num_correspondencias):
                # Data aleatória nos últimos 60 dias
                dias_atras = random.randint(1, 60)
                data_recebimento = timezone.now() - timedelta(days=dias_atras)
                
                tipo = random.choice(tipos_correspondencia)
                remetente = random.choice(remetentes)
                
                # Status baseado na data (mais antigas têm maior chance de serem retiradas)
                if dias_atras > 30:
                    status = random.choice(['RETIRADA', 'RETIRADA', 'RECEBIDA'])
                elif dias_atras > 15:
                    status = random.choice(['RETIRADA', 'RECEBIDA'])
                else:
                    status = random.choice(['RECEBIDA', 'RECEBIDA', 'RETIRADA'])

                correspondencia_data = {
                    'caixa_postal': caixa,
                    'data_recebimento': data_recebimento,
                    'descricao': f'{tipo} de {remetente} para {cliente.nome}',
                    'tipo': tipo,
                    'status': status,
                    'remetente': remetente,
                    'codigo_rastreamento': f'BR{random.randint(100000000, 999999999)}BR' if random.choice([True, False]) else None,
                }

                if status == 'RETIRADA':
                    correspondencia_data['data_retirada'] = data_recebimento + timedelta(
                        days=random.randint(1, min(15, dias_atras))
                    )
                    correspondencia_data['retirado_por'] = cliente.nome
                    correspondencia_data['documento_retirada'] = cliente.documento

                correspondencia = Correspondencia.objects.create(**correspondencia_data)

            self.stdout.write(f'✓ {num_correspondencias} correspondências criadas para {cliente.nome}')

        # Criar contratos para alguns clientes PJ e alguns PF
        planos = ['BASICO', 'PREMIUM', 'EMPRESARIAL']
        valores = {'BASICO': Decimal('50.00'), 'PREMIUM': Decimal('100.00'), 'EMPRESARIAL': Decimal('200.00')}
        
        clientes_para_contrato = random.sample(clientes_criados, min(4, len(clientes_criados)))
        
        for cliente in clientes_para_contrato:
            # Preferir plano empresarial para PJ
            if cliente.tipo == 'PJ':
                plano = random.choice(['PREMIUM', 'EMPRESARIAL'])
            else:
                plano = random.choice(['BASICO', 'PREMIUM'])
            
            # Data de início nos últimos 12 meses
            meses_atras = random.randint(1, 12)
            data_inicio = date.today() - timedelta(days=meses_atras * 30)
            
            # Duração do contrato
            duracao = random.choice([6, 12, 24])
            
            # Status baseado na data
            from dateutil.relativedelta import relativedelta
            data_vencimento = data_inicio + relativedelta(months=duracao)
            
            if data_vencimento < date.today():
                status_contrato = random.choice(['VENCIDO', 'CANCELADO'])
            else:
                status_contrato = 'ATIVO'

            contrato_data = {
                'cliente': cliente,
                'plano': plano,
                'valor_mensal': valores[plano],
                'data_inicio': data_inicio,
                'duracao_meses': duracao,
                'status': status_contrato,
                'observacoes': f'Contrato {plano.lower()} para {cliente.nome}'
            }

            contrato = Contrato.objects.create(**contrato_data)
            self.stdout.write(f'✓ Contrato {plano} criado para {cliente.nome}')

        # Estatísticas finais
        total_clientes = Cliente.objects.count()
        total_caixas = CaixaPostal.objects.count()
        total_correspondencias = Correspondencia.objects.count()
        correspondencias_pendentes = Correspondencia.objects.filter(status='RECEBIDA').count()
        total_contratos = Contrato.objects.count()

        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('DADOS DE EXEMPLO CRIADOS COM SUCESSO!'))
        self.stdout.write('='*50)
        self.stdout.write(f'📊 ESTATÍSTICAS:')
        self.stdout.write(f'   • Clientes: {total_clientes}')
        self.stdout.write(f'   • Caixas Postais: {total_caixas}')
        self.stdout.write(f'   • Correspondências: {total_correspondencias}')
        self.stdout.write(f'   • Pendentes: {correspondencias_pendentes}')
        self.stdout.write(f'   • Contratos: {total_contratos}')
        self.stdout.write('='*50)