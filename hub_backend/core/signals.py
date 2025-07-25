from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Cliente, CaixaPostal


@receiver(post_save, sender=Cliente)
def create_caixa_postal(sender, instance, created, **kwargs):
    """
    Cria automaticamente uma CaixaPostal quando um Cliente é criado.
    """
    if created:
        CaixaPostal.objects.create(
            cliente=instance,
            observacoes=f"Caixa criada automaticamente para {instance.nome}"
        )