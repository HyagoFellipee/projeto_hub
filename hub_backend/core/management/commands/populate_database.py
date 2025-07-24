from django.core.management.base import BaseCommand
from core.models import Cliente, CaixaPostal, Correspondencia, Contrato
from django.utils import timezone
from datetime import timedelta, date
import random
from decimal import Decimal
from faker import Faker
import string
import re

class Command(BaseCommand):
    help = 'Create comprehensive sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before creating new data',
        )
        parser.add_argument(
            '--clientes',
            type=int,
            default=500,
            help='Number of clients to create (default: 500)',
        )

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

        # ============ USAR APENAS TIPOS DO MODELO ============
        
        # Tipos de correspondência EXATOS do models.py
        TIPOS_CORRESPONDENCIA = [
            'CARTA',
            'PACOTE', 
            'AR',
            'SEDEX',
            'PAC',
            'ENCOMENDA',
            'DOCUMENTO',
            'OUTRO'
        ]
        
        # Status de correspondência EXATOS do models.py
        STATUS_CORRESPONDENCIA = [
            'RECEBIDA',
            'RETIRADA', 
            'DEVOLVIDA'
        ]
        
        # Planos EXATOS do models.py
        PLANOS = [
            'BASICO',
            'PREMIUM',
            'EMPRESARIAL'
        ]
        
        # Status de contrato EXATOS do models.py
        STATUS_CONTRATO = [
            'ATIVO',
            'VENCIDO',
            'CANCELADO',
            'SUSPENSO'
        ]
        
        # ============ DADOS REALISTAS ============
        
        # Nomes de empresas realistas
        nomes_empresas = [
            'Tech Solutions', 'Digital Systems', 'Smart Business', 'Future Corp',
            'Global Trade', 'Prime Services', 'Elite Consultoria', 'Nova Era',
            'Inovação Total', 'Estratégia Plus', 'Mercado Líder', 'Qualidade First',
            'Excelência Pro', 'Vanguarda Tech', 'Pioneira Digital', 'Moderna Gestão',
            'Eficiência Max', 'Produtividade +', 'Competência Total', 'Expertise Avançada',
            'Comercial Brasil', 'Indústria Nacional', 'Logística Express', 'Varejo Moderno',
            'Atacado Premium', 'Distribuição Rápida', 'Suprimentos Gerais', 'Materiais Pro',
            'Construção Sólida', 'Engenharia Avançada', 'Arquitetura Criativa', 'Design Studio',
            'Marketing Digital', 'Publicidade Criativa', 'Comunicação Visual', 'Mídia Online',
            'Educação Transformadora', 'Conhecimento Plus', 'Aprendizado Ativo', 'Escola Futura',
            'Saúde Integral', 'Medicina Preventiva', 'Bem-Estar Total', 'Vida Saudável',
            'Alimentação Natural', 'Nutrição Balanceada', 'Sabor Especial', 'Gastronomia Fina',
            'Transporte Seguro', 'Mobilidade Urbana', 'Viagem Confortável', 'Turismo Aventura',
            'Imóveis Prime', 'Construtora Moderna', 'Incorporação Inteligente', 'Habitação Plus',
            'Tecnologia Avançada', 'Inovação Contínua', 'Desenvolvimento Ágil', 'Software House'
        ]
        
        sufixos_empresas = ['Ltda', 'S.A.', 'EIRELI', 'ME', 'EPP', 'SS', 'Sociedade Simples']
        
        # Remetentes diversos
        remetentes_correios = [
            'Correios', 'Sedex', 'PAC', 'Carta Registrada', 'AR - Aviso de Recebimento'
        ]
        
        remetentes_ecommerce = [
            'Amazon', 'Mercado Livre', 'Magazine Luiza', 'Casas Bahia', 'Americanas',
            'Shopee', 'AliExpress', 'OLX', 'Submarino', 'Extra', 'Pontofrio',
            'Netshoes', 'Zara', 'C&A', 'Renner', 'Riachuelo', 'Shein', 'Wish'
        ]
        
        remetentes_bancos = [
            'Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander',
            'Nubank', 'Inter', 'BTG Pactual', 'Safra', 'Votorantim', 'Sicoob', 'Sicredi'
        ]
        
        remetentes_governo = [
            'Receita Federal', 'INSS', 'Prefeitura Municipal', 'Governo do Estado',
            'Tribunal de Justiça', 'Ministério da Fazenda', 'Detran', 'Cartório',
            'Fórum', 'Defensoria Pública', 'Ministério Público', 'Polícia Civil'
        ]
        
        remetentes_servicos = [
            'Conta de Luz', 'Conta de Água', 'Conta de Gás', 'Internet/TV',
            'Telefone', 'Plano de Saúde', 'Seguro Auto', 'Seguro Residencial',
            'Universidade', 'Escola', 'Curso Técnico', 'Advocacia', 'Contabilidade'
        ]
        
        todos_remetentes = (remetentes_correios + remetentes_ecommerce + 
                        remetentes_bancos + remetentes_governo + remetentes_servicos)
        
        # Estados brasileiros para endereços
        estados_brasil = [
            'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE',
            'PA', 'MA', 'PB', 'ES', 'PI', 'AL', 'RN', 'MT', 'MS', 'DF',
            'SE', 'AM', 'RO', 'AC', 'AP', 'RR', 'TO'
        ]
        
        # Planos e valores
        planos_detalhados = {
            'BASICO': {'valor': Decimal('49.90'), 'peso': 40},
            'PREMIUM': {'valor': Decimal('129.90'), 'peso': 20},
            'EMPRESARIAL': {'valor': Decimal('299.90'), 'peso': 8}
        }

        # ============ FUNÇÃO PARA GERAR TELEFONE BRASILEIRO ============
        def gerar_telefone_brasileiro():
            # DDDs válidos do Brasil
            ddds = [
                11, 12, 13, 14, 15, 16, 17, 18, 19,  # SP
                21, 22, 24,  # RJ
                27, 28,  # ES
                31, 32, 33, 34, 35, 37, 38,  # MG
                41, 42, 43, 44, 45, 46,  # PR
                47, 48, 49,  # SC
                51, 53, 54, 55,  # RS
                61,  # DF
                62, 64,  # GO
                63,  # TO
                65, 66,  # MT
                67,  # MS
                68,  # AC
                69,  # RO
                71, 73, 74, 75, 77,  # BA
                79,  # SE
                81, 87,  # PE
                82,  # AL
                83,  # PB
                84,  # RN
                85, 88,  # CE
                86, 89,  # PI
                91, 93, 94,  # PA
                92, 97,  # AM
                95,  # RR
                96,  # AP
                98, 99   # MA
            ]
            
            ddd = random.choice(ddds)
            
            # 70% celular (9 na frente), 30% fixo
            if random.random() < 0.7:
                # Celular: (DD) 9XXXX-XXXX
                numero = f"9{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
                return f"({ddd:02d}) {numero[:5]}-{numero[5:]}"
            else:
                # Fixo: (DD) XXXX-XXXX
                numero = f"{random.randint(2000, 9999)}{random.randint(1000, 9999)}"
                return f"({ddd:02d}) {numero[:4]}-{numero[4:]}"

        # ============ CRIAÇÃO DE CLIENTES ============
        
        clientes_criados = []
        cpfs_usados = set()
        cnpjs_usados = set()
        emails_usados = set()
        
        # 70% PF, 30% PJ para ser mais realista
        num_pf = int(num_clientes * 0.7)
        num_pj = num_clientes - num_pf
        
        self.stdout.write(f'👥 Criando {num_pf} Pessoas Físicas e {num_pj} Pessoas Jurídicas...')
        
        # Criar Pessoas Físicas
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
            
            nome = fake.name()
            telefone = gerar_telefone_brasileiro()
            endereco = f"{fake.street_address()}, {fake.city()}, {random.choice(estados_brasil)}"
            
            # 95% ativo, 5% inativo
            ativo = random.random() < 0.95
            
            cliente_data = {
                'tipo': 'PF',
                'nome': nome,
                'documento': cpf,
                'email': email,
                'telefone': telefone,
                'endereco': endereco,
                'ativo': ativo
            }
            
            cliente = Cliente.objects.create(**cliente_data)
            clientes_criados.append(cliente)
            
            if (i + 1) % 50 == 0:
                self.stdout.write(f'   ✓ {i + 1}/{num_pf} PF criados...')
        
        # Criar Pessoas Jurídicas  
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
            nome = f"{nome_empresa} {sufixo}"
            
            telefone = gerar_telefone_brasileiro()
            endereco = f"{fake.street_address()}, {fake.city()}, {random.choice(estados_brasil)}"
            
            # 90% ativo, 10% inativo para PJ
            ativo = random.random() < 0.90
            
            cliente_data = {
                'tipo': 'PJ',
                'nome': nome,
                'documento': cnpj,
                'email': email,
                'telefone': telefone,
                'endereco': endereco,
                'ativo': ativo
            }
            
            cliente = Cliente.objects.create(**cliente_data)
            clientes_criados.append(cliente)
            
            if (i + 1) % 20 == 0:
                self.stdout.write(f'   ✓ {i + 1}/{num_pj} PJ criados...')

        self.stdout.write(self.style.SUCCESS(f'✅ {len(clientes_criados)} clientes criados!'))

        # ============ CRIAÇÃO DE CAIXAS POSTAIS E CORRESPONDÊNCIAS ============
        
        self.stdout.write('📮 Criando caixas postais e correspondências...')
        
        total_correspondencias = 0
        
        for idx, cliente in enumerate(clientes_criados):
            # Criar caixa postal
            caixa = CaixaPostal.objects.create(
                cliente=cliente,
                ativa=cliente.ativo,  # Caixa inativa se cliente inativo
                observacoes=f'Caixa postal - {cliente.tipo} - {cliente.nome[:30]}'
            )
            
            # Número de correspondências baseado no tipo e status
            if not cliente.ativo:
                # Clientes inativos têm menos correspondências
                num_correspondencias = random.randint(1, 5)
            elif cliente.tipo == 'PJ':
                # Empresas recebem mais correspondências
                num_correspondencias = random.randint(8, 25)
            else:
                # Pessoas físicas
                num_correspondencias = random.randint(3, 15)
            
            # Criar correspondências com distribuição temporal realista
            for j in range(num_correspondencias):
                # Distribuição temporal: mais recentes têm maior probabilidade
                if random.random() < 0.3:  # 30% últimos 7 dias
                    dias_atras = random.randint(1, 7)
                elif random.random() < 0.5:  # 20% últimos 30 dias
                    dias_atras = random.randint(8, 30)
                elif random.random() < 0.3:  # 30% últimos 90 dias
                    dias_atras = random.randint(31, 90)
                else:  # 20% mais antigas
                    dias_atras = random.randint(91, 365)
                
                data_recebimento = timezone.now() - timedelta(days=dias_atras)
                
                # Escolher tipo e remetente de forma inteligente
                if cliente.tipo == 'PJ':
                    # Empresas recebem mais documentos oficiais e menos e-commerce
                    peso_governo = 0.3
                    peso_bancos = 0.25
                    peso_servicos = 0.25
                    peso_ecommerce = 0.15
                    peso_correios = 0.05
                else:
                    # PF recebe mais e-commerce e menos documentos oficiais
                    peso_ecommerce = 0.35
                    peso_servicos = 0.25
                    peso_bancos = 0.2
                    peso_governo = 0.15
                    peso_correios = 0.05
                
                rand = random.random()
                if rand < peso_ecommerce:
                    remetente = random.choice(remetentes_ecommerce)
                    tipo = random.choice(['PACOTE', 'ENCOMENDA', 'SEDEX', 'PAC'])
                elif rand < peso_ecommerce + peso_servicos:
                    remetente = random.choice(remetentes_servicos)
                    tipo = random.choice(['CARTA', 'DOCUMENTO'])
                elif rand < peso_ecommerce + peso_servicos + peso_bancos:
                    remetente = random.choice(remetentes_bancos)
                    tipo = random.choice(['CARTA', 'DOCUMENTO'])
                elif rand < peso_ecommerce + peso_servicos + peso_bancos + peso_governo:
                    remetente = random.choice(remetentes_governo)
                    tipo = random.choice(['DOCUMENTO', 'AR'])
                else:
                    remetente = random.choice(remetentes_correios)
                    tipo = random.choice(TIPOS_CORRESPONDENCIA)
                
                # Status baseado na idade da correspondência
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
                
                # Descrição mais detalhada
                descricoes_por_tipo = {
                    'PACOTE': f'Pacote de {remetente}',
                    'ENCOMENDA': f'Encomenda de {remetente}',
                    'CARTA': f'Correspondência de {remetente}',
                    'DOCUMENTO': f'Documento de {remetente}',
                    'AR': f'AR de {remetente}',
                    'SEDEX': f'SEDEX de {remetente}',
                    'PAC': f'PAC de {remetente}',
                }
                
                descricao = descricoes_por_tipo.get(tipo, f'{tipo} de {remetente}')
                
                # Código de rastreamento para alguns tipos
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
                
                # Se foi retirada, adicionar dados de retirada
                if status == 'RETIRADA':
                    dias_para_retirada = random.randint(1, min(10, dias_atras))
                    correspondencia_data['data_retirada'] = data_recebimento + timedelta(days=dias_para_retirada)
                    correspondencia_data['retirado_por'] = cliente.nome
                    correspondencia_data['documento_retirada'] = cliente.documento
                
                Correspondencia.objects.create(**correspondencia_data)
                total_correspondencias += 1
            
            if (idx + 1) % 50 == 0:
                self.stdout.write(f'   ✓ {idx + 1}/{len(clientes_criados)} clientes processados...')

        self.stdout.write(self.style.SUCCESS(f'✅ {total_correspondencias} correspondências criadas!'))

        # ============ CRIAÇÃO DE CONTRATOS ============
        
        self.stdout.write('📋 Criando contratos...')
        
        # 60% dos clientes têm contrato
        clientes_com_contrato = random.sample(clientes_criados, int(len(clientes_criados) * 0.6))
        
        contratos_criados = 0
        for cliente in clientes_com_contrato:
            # PJ têm maior chance de planos premium
            if cliente.tipo == 'PJ':
                planos_pesos = [
                    ('BASICO', 20), ('PREMIUM', 40), ('EMPRESARIAL', 40)
                ]
            else:
                planos_pesos = [
                    ('BASICO', 60), ('PREMIUM', 30), ('EMPRESARIAL', 10)
                ]
            
            planos, pesos = zip(*planos_pesos)
            plano = random.choices(planos, weights=pesos)[0]
            
            # Data de início (últimos 24 meses)
            meses_atras = random.randint(1, 24)
            data_inicio = date.today() - timedelta(days=meses_atras * 30)
            
            # Duração do contrato
            if cliente.tipo == 'PJ':
                duracao = random.choices([12, 24, 36], weights=[30, 50, 20])[0]
            else:
                duracao = random.choices([6, 12, 24], weights=[40, 45, 15])[0]
            
            # Calcular status baseado na data
            from dateutil.relativedelta import relativedelta
            data_vencimento = data_inicio + relativedelta(months=duracao)
            
            if data_vencimento < date.today():
                if random.random() < 0.8:  # 80% dos vencidos renovam
                    status = 'ATIVO'  # Renovado
                    data_inicio = data_vencimento  # Nova data de início
                    data_vencimento = data_inicio + relativedelta(months=duracao)
                else:
                    status = random.choice(['VENCIDO', 'CANCELADO'])
            else:
                if not cliente.ativo:
                    status = 'CANCELADO'
                else:
                    status = 'ATIVO'
            
            valor_base = planos_detalhados[plano]['valor']
            # Pequenas variações no valor (descontos/promoções)
            variacao = random.uniform(0.9, 1.1)
            valor_final = (valor_base * Decimal(str(variacao))).quantize(Decimal('0.01'))
            
            contrato_data = {
                'cliente': cliente,
                'plano': plano,
                'valor_mensal': valor_final,
                'data_inicio': data_inicio,
                'duracao_meses': duracao,
                'status': status,
                'observacoes': f'Contrato {plano} - {cliente.tipo} - Status: {status}'
            }
            
            Contrato.objects.create(**contrato_data)
            contratos_criados += 1

        self.stdout.write(self.style.SUCCESS(f'✅ {contratos_criados} contratos criados!'))

        # ============ ESTATÍSTICAS FINAIS ============
        
        total_clientes = Cliente.objects.count()
        clientes_pf = Cliente.objects.filter(tipo='PF').count()
        clientes_pj = Cliente.objects.filter(tipo='PJ').count()
        clientes_ativos = Cliente.objects.filter(ativo=True).count()
        
        total_caixas = CaixaPostal.objects.count()
        caixas_ativas = CaixaPostal.objects.filter(ativa=True).count()
        
        total_correspondencias = Correspondencia.objects.count()
        correspondencias_pendentes = Correspondencia.objects.filter(status='RECEBIDA').count()
        correspondencias_hoje = Correspondencia.objects.filter(
            data_recebimento__date=timezone.now().date()
        ).count()
        correspondencias_semana = Correspondencia.objects.filter(
            data_recebimento__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        total_contratos = Contrato.objects.count()
        contratos_ativos = Contrato.objects.filter(status='ATIVO').count()
        contratos_vencidos = Contrato.objects.filter(status='VENCIDO').count()
        contratos_cancelados = Contrato.objects.filter(status='CANCELADO').count()
        
        # Estatísticas por plano
        stats_planos = {}
        for plano in PLANOS:
            count = Contrato.objects.filter(plano=plano).count()
            if count > 0:
                stats_planos[plano] = count

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
        self.stdout.write(f'   • Média por cliente: {total_correspondencias/total_clientes:.1f}')
        
        self.stdout.write('\n📋 CONTRATOS:')
        self.stdout.write(f'   • Total: {total_contratos}')
        self.stdout.write(f'   • Ativos: {contratos_ativos} ({contratos_ativos/total_contratos*100:.1f}%)')
        self.stdout.write(f'   • Vencidos: {contratos_vencidos} ({contratos_vencidos/total_contratos*100:.1f}%)')
        self.stdout.write(f'   • Cancelados: {contratos_cancelados} ({contratos_cancelados/total_contratos*100:.1f}%)')
        
        if stats_planos:
            self.stdout.write('\n📊 DISTRIBUIÇÃO POR PLANO:')
            for plano, count in stats_planos.items():
                self.stdout.write(f'   • {plano}: {count} ({count/total_contratos*100:.1f}%)')
        
        self.stdout.write('='*60)
        self.stdout.write('💡 Para testar com mais dados, execute:')
        self.stdout.write('   python manage.py populate_database --clientes 1000')
        self.stdout.write('='*60)
