from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clientes', views.ClienteViewSet, basename='cliente')
router.register(r'caixas-postais', views.CaixaPostalViewSet, basename='caixapostal')
router.register(r'correspondencias', views.CorrespondenciaViewSet, basename='correspondencia')
router.register(r'contratos', views.ContratoViewSet, basename='contrato')

urlpatterns = [
    path('', include(router.urls)),
    
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('clientes/<uuid:cliente_id>/correspondencias/', 
         views.CorrespondenciasPorClienteView.as_view(), 
         name='correspondencias-por-cliente'),
    path('correspondencias/<uuid:correspondencia_id>/marcar-retirada/', 
         views.MarcarCorrespondenciaRetiradaView.as_view(), 
         name='marcar-correspondencia-retirada'),
    path('relatorios/correspondencias/', 
         views.RelatorioCorrespondenciasView.as_view(), 
         name='relatorio-correspondencias'),
]