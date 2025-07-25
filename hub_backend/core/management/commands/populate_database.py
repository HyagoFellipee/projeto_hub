from django.core.management.base import BaseCommand
from core.models import Cliente, CaixaPostal, Correspondencia, Contrato
from django.utils import timezone
from datetime import timedelta, date
import random
from decimal import Decimal
from faker import Faker
import pytz

class Command(BaseCommand):
    help = 'Create comprehensive sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear all existing data before creating new data')
        parser.add_argument('--clientes', type=int, default=500, help='Number of clients to create (default: 500)')

    def handle(self, *args, **options):
        fake = Faker('pt_BR')
        
        if options['clear']:
            self.stdout.write('🗑️  Limpando dados existentes...')
            Correspondencia.objects.all().delete()
            Contrato.objects.all().delete()
            CaixaPostal.objects.all().delete()
            Cliente.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Dados limpos!'))

        num_clientes = options['clientes']
        self.stdout.write(f'🚀 Criando {num_clientes} clientes com dados completos...')

        TIPOS_CORRESPONDENCIA = ['CARTA', 'PACOTE', 'AR', 'SEDEX', 'PAC', 'ENCOMENDA', 'DOCUMENTO', 'OUTRO']
        STATUS_CORRESPONDENCIA = ['RECEBIDA', 'RETIRADA', 'DEVOLVIDA']
        PLANOS = ['BASICO', 'PREMIUM', 'EMPRESARIAL']
        STATUS_CONTRATO = ['ATIVO', 'VENCIDO', 'CANCELADO', 'SUSPENSO']

        nomes_empresas = [
            'Tech Solutions', 'Digital Systems', 'Smart Business', 'Future Corp',
            'Global Trade', 'Prime Services', 'Elite Consultoria', 'Nova Era',
            'Inovação Total', 'Estratégia Plus', 'Mercado Líder', 'Qualidade First',
            'Excelência Pro', 'Vanguarda Tech', 'Pioneira Digital', 'Moderna Gestão'
        ]
        
        sufixos_empresas = ['Ltda', 'S.A.', 'EIRELI', 'ME', 'EPP', 'SS', 'Sociedade Simples']
        
        remetentes_ecommerce = ['Amazon', 'Mercado Livre', 'Magazine Luiza', 'Casas Bahia', 'Americanas', 'Shopee']
        remetentes_bancos = ['Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 'Nubank']
        remetentes_governo = ['Receita Federal', 'INSS', 'Prefeitura Municipal', 'Detran', 'Cartório']
        remetentes_servicos = ['Conta de Luz', 'Conta de Água', 'Internet/TV', 'Plano de Saúde']
        remetentes_correios = ['Correios', 'Sedex', 'PAC', 'Carta Registrada']
        
        estados_brasil = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE']
        
        planos_detalhados = {
            'BASICO': {'valor': Decimal('49.90')},
            'PREMIUM': {'valor': Decimal('129.90')},
            'EMPRESARIAL': {'valor': Decimal('299.90')}
        }

        def gerar_telefone_brasileiro():
            ddds = [11, 21, 31, 41, 51, 61, 71, 81, 85, 91]
            ddd = random.choice(ddds)
            if random.random() < 0.7:
                numero = f"9{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
                return f"({ddd:02d}) {numero[:5]}-{numero[5:]}"
            else:
                numero = f"{random.randint(2000, 9999)}{random.randint(1000, 9999)}"
                return f"({ddd:02d}) {numero[:4]}-{numero[4:]}"

        clientes_criados = []
        cpfs_usados = set()
        cnpjs_usados = set()
        emails_usados = set()
        
        num_pf = int(num_clientes * 0.7)
        num_pj = num_clientes - num_pf
        
        for i in range(num_pf):
            while True:
                cpf = fake.cpf().replace('.', '').replace('-', '')
                if cpf not in cpfs_usados:
                    cpfs_usados.add(cpf)
                    break
            
            while True:
                email = fake.email()
                if email not in emails_usados:
                    emails_usados.add(email)
                    break
            
            cliente = Cliente.objects.create(
                tipo='PF',
                nome=fake.name(),
                documento=cpf,
                email=email,
                telefone=gerar_telefone_brasileiro(),
                endereco=f"{fake.street_address()}, {fake.city()}, {random.choice(estados_brasil)}",
                ativo=random.random() < 0.95
            )
            clientes_criados.append(cliente)
        
        for i in range(num_pj):
            while True:
                cnpj = fake.cnpj().replace('.', '').replace('/', '').replace('-', '')
                if cnpj not in cnpjs_usados:
                    cnpjs_usados.add(cnpj)
                    break
            
            while True:
                email = fake.company_email()
                if email not in emails_usados:
                    emails_usados.add(email)
                    break
            
            nome_empresa = random.choice(nomes_empresas)
            sufixo = random.choice(sufixos_empresas)
            
            cliente = Cliente.objects.create(
                tipo='PJ',
                nome=f"{nome_empresa} {sufixo}",
                documento=cnpj,
                email=email,
                telefone=gerar_telefone_brasileiro(),
                endereco=f"{fake.street_address()}, {fake.city()}, {random.choice(estados_brasil)}",
                ativo=random.random() < 0.90
            )
            clientes_criados.append(cliente)

        self.stdout.write(self.style.SUCCESS(f'✅ {len(clientes_criados)} clientes criados!'))

        brasilia_tz = pytz.timezone('America/Sao_Paulo')
        agora_brasilia = timezone.now().astimezone(brasilia_tz)
        data_atual = agora_brasilia.date()
        hora_atual = agora_brasilia.time()
        
        total_correspondencias = 0
        
        for cliente in clientes_criados:
            caixa = CaixaPostal.objects.create(
                cliente=cliente,
                ativa=cliente.ativo,
                observacoes=f'Caixa postal - {cliente.tipo} - {cliente.nome[:30]}'
            )
            
            if not cliente.ativo:
                num_correspondencias = random.randint(1, 5)
            elif cliente.tipo == 'PJ':
                num_correspondencias = random.randint(8, 25)
            else:
                num_correspondencias = random.randint(3, 15)
            
            for j in range(num_correspondencias):
                if random.random() < 0.3:
                    dias_atras = random.randint(1, 7)
                elif random.random() < 0.5:
                    dias_atras = random.randint(8, 30)
                elif random.random() < 0.3:
                    dias_atras = random.randint(31, 90)
                else:
                    dias_atras = random.randint(91, 365)
                
                data_recebimento = agora_brasilia - timedelta(days=dias_atras)
                
                if data_recebimento.date() == data_atual:
                    hora_aleatoria = random.uniform(0, min(hora_atual.hour + hora_atual.minute/60.0, 23.99))
                    horas = int(hora_aleatoria)
                    minutos = int((hora_aleatoria - horas) * 60)
                    data_recebimento = data_recebimento.replace(hour=horas, minute=minutos, second=random.randint(0, 59))
                
                if data_recebimento > agora_brasilia:
                    data_recebimento = agora_brasilia - timedelta(days=1)

                if cliente.tipo == 'PJ':
                    remetentes = remetentes_governo + remetentes_bancos + remetentes_servicos
                    tipos = ['DOCUMENTO', 'AR', 'CARTA']
                else:
                    remetentes = remetentes_ecommerce + remetentes_servicos + remetentes_bancos
                    tipos = ['PACOTE', 'ENCOMENDA', 'SEDEX', 'PAC', 'CARTA']
                
                remetente = random.choice(remetentes)
                tipo = random.choice(tipos)

                if dias_atras > 60:
                    status = random.choices(['RETIRADA', 'RECEBIDA'], weights=[85, 15])[0]
                elif dias_atras > 30:
                    status = random.choices(['RETIRADA', 'RECEBIDA'], weights=[75, 25])[0]
                elif dias_atras > 15:
                    status = random.choices(['RETIRADA', 'RECEBIDA'], weights=[60, 40])[0]
                elif dias_atras > 7:
                    status = random.choices(['RETIRADA', 'RECEBIDA'], weights=[40, 60])[0]
                else:
                    status = random.choices(['RETIRADA', 'RECEBIDA'], weights=[20, 80])[0]
                
                descricao = f'{tipo} de {remetente}'
                
                codigo_rastreamento = None
                if tipo in ['SEDEX', 'PAC', 'AR', 'PACOTE', 'ENCOMENDA'] and random.random() < 0.7:
                    codigo_rastreamento = f'BR{random.randint(100000000, 999999999)}BR'
                
                correspondencia_data = {
                    'caixa_postal': caixa,
                    'data_recebimento': data_recebimento,
                    'descricao': descricao,
                    'tipo': tipo,
                    'status': status,
                    'remetente': remetente,
                    'codigo_rastreamento': codigo_rastreamento,
                }
                
                if status == 'RETIRADA':
                    dias_para_retirada = random.randint(1, min(10, dias_atras))
                    data_retirada = data_recebimento + timedelta(days=dias_para_retirada)
                    
                    if data_retirada > agora_brasilia:
                        data_retirada = agora_brasilia - timedelta(hours=random.randint(1, 24))
                    
                    correspondencia_data['data_retirada'] = data_retirada
                    correspondencia_data['retirado_por'] = cliente.nome
                    correspondencia_data['documento_retirada'] = cliente.documento
                
                Correspondencia.objects.create(**correspondencia_data)
                total_correspondencias += 1

        self.stdout.write(self.style.SUCCESS(f'✅ {total_correspondencias} correspondências criadas!'))

        clientes_com_contrato = random.sample(clientes_criados, int(len(clientes_criados) * 0.6))
        contratos_criados = 0
        
        for cliente in clientes_com_contrato:
            if cliente.tipo == 'PJ':
                planos_pesos = [('BASICO', 20), ('PREMIUM', 40), ('EMPRESARIAL', 40)]
            else:
                planos_pesos = [('BASICO', 60), ('PREMIUM', 30), ('EMPRESARIAL', 10)]
            
            planos, pesos = zip(*planos_pesos)
            plano = random.choices(planos, weights=pesos)[0]
            
            meses_atras = random.randint(1, 24)
            data_inicio = data_atual - timedelta(days=meses_atras * 30)
            
            duracao = random.choices([12, 24, 36], weights=[30, 50, 20])[0] if cliente.tipo == 'PJ' else random.choices([6, 12, 24], weights=[40, 45, 15])[0]
            
            from dateutil.relativedelta import relativedelta
            data_vencimento = data_inicio + relativedelta(months=duracao)
            
            if data_vencimento < data_atual:
                status = 'ATIVO' if random.random() < 0.8 else random.choice(['VENCIDO', 'CANCELADO'])
            else:
                status = 'CANCELADO' if not cliente.ativo else 'ATIVO'
            
            valor_base = planos_detalhados[plano]['valor']
            variacao = random.uniform(0.9, 1.1)
            valor_final = (valor_base * Decimal(str(variacao))).quantize(Decimal('0.01'))
            
            Contrato.objects.create(
                cliente=cliente,
                plano=plano,
                valor_mensal=valor_final,
                data_inicio=data_inicio,
                duracao_meses=duracao,
                status=status,
                observacoes=f'Contrato {plano} - {cliente.tipo} - Status: {status}'
            )
            contratos_criados += 1

        self.stdout.write(self.style.SUCCESS(f'✅ {contratos_criados} contratos criados!'))

        correspondencias_futuro = Correspondencia.objects.filter(data_recebimento__gt=agora_brasilia).count()
        if correspondencias_futuro > 0:
            Correspondencia.objects.filter(data_recebimento__gt=agora_brasilia).update(
                data_recebimento=agora_brasilia - timedelta(days=1)
            )

        total_clientes = Cliente.objects.count()
        clientes_pf = Cliente.objects.filter(tipo='PF').count()
        clientes_pj = Cliente.objects.filter(tipo='PJ').count()
        clientes_ativos = Cliente.objects.filter(ativo=True).count()
        
        total_caixas = CaixaPostal.objects.count()
        caixas_ativas = CaixaPostal.objects.filter(ativa=True).count()
        
        total_correspondencias = Correspondencia.objects.count()
        correspondencias_pendentes = Correspondencia.objects.filter(status='RECEBIDA').count()
        correspondencias_hoje = Correspondencia.objects.filter(data_recebimento__date=data_atual).count()
        correspondencias_semana = Correspondencia.objects.filter(data_recebimento__gte=agora_brasilia - timedelta(days=7)).count()
        
        total_contratos = Contrato.objects.count()
        contratos_ativos = Contrato.objects.filter(status='ATIVO').count()

        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('🎉 BANCO POPULADO COM SUCESSO!'))
        self.stdout.write('='*60)
        
        self.stdout.write('👥 CLIENTES:')
        self.stdout.write(f'   • Total: {total_clientes}')
        self.stdout.write(f'   • Pessoas Físicas: {clientes_pf} ({clientes_pf/total_clientes*100:.1f}%)')
        self.stdout.write(f'   • Pessoas Jurídicas: {clientes_pj} ({clientes_pj/total_clientes*100:.1f}%)')
        self.stdout.write(f'   • Ativos: {clientes_ativos} ({clientes_ativos/total_clientes*100:.1f}%)')
        
        self.stdout.write('\n📮 CAIXAS POSTAIS:')
        self.stdout.write(f'   • Total: {total_caixas}')
        self.stdout.write(f'   • Ativas: {caixas_ativas} ({caixas_ativas/total_caixas*100:.1f}%)')
        
        self.stdout.write('\n📬 CORRESPONDÊNCIAS:')
        self.stdout.write(f'   • Total: {total_correspondencias}')
        self.stdout.write(f'   • Pendentes: {correspondencias_pendentes} ({correspondencias_pendentes/total_correspondencias*100:.1f}%)')
        self.stdout.write(f'   • Hoje: {correspondencias_hoje}')
        self.stdout.write(f'   • Última semana: {correspondencias_semana}')
        
        self.stdout.write('\n📋 CONTRATOS:')
        self.stdout.write(f'   • Total: {total_contratos}')
        self.stdout.write(f'   • Ativos: {contratos_ativos} ({contratos_ativos/total_contratos*100:.1f}%)')
        
        self.stdout.write('='*60)