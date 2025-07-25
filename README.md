# 📮 Sistema HUB - Correspondências

**Sistema de gestão de correspondências com Django + React**

## 📋 Descrição do Projeto

Sistema completo para gerenciamento de correspondências de clientes, permitindo:
- Cadastro de clientes (PF/PJ)
- Gestão de caixas postais (uma por cliente)
- Registro e controle de correspondências
- Interface web responsiva com dashboard

## ⚙️ Requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.10+ (para desenvolvimento local)
- PostgreSQL (para desenvolvimento local)

## 🚀 Executar com Docker

```bash
# Clone o repositório
git clone <seu-repositorio>
cd projeto_hub

# Subir todos os serviços
docker-compose up --build

# Criar superuser (obrigatório)
docker exec -it hub_backend python manage.py createsuperuser
```

**Acessos:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8002/api/
- Admin Django: http://localhost:8002/admin/
- Swagger/OpenAPI: http://localhost:8002/api/docs/

**Credenciais:** Use as credenciais do superuser criado para acessar tanto o frontend quanto o admin.

## 💻 Executar Localmente

### Backend
```bash
cd hub_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Configurar PostgreSQL local e ajustar .env
python manage.py migrate
python manage.py createsuperuser
python manage.py populate_database --clear --clientes 50
python manage.py runserver 8002
```

### Frontend
```bash
cd hub_frontend
npm install
npm run dev
```

## 📊 Funcionalidades Implementadas

**Backend (Django + DRF):**
- ✅ CRUD de Clientes (PF/PJ com validações)
- ✅ CRUD de Caixas Postais (criação automática)
- ✅ CRUD de Correspondências
- ✅ Autenticação JWT
- ✅ Sistema de contratos (bonus)

**Frontend (React):**
- ✅ Tela de login
- ✅ Dashboard com métricas
- ✅ Cadastro e listagem de clientes
- ✅ Registro de correspondências
- ✅ Interface responsiva

## 🗄️ Banco de Dados

**PostgreSQL (Docker):**
- Host: localhost:5435
- Database: hub_db
- User: postgres
- Password: PANdemo123

O sistema vem com dados de teste: 50 clientes, caixas postais e 500+ correspondências.