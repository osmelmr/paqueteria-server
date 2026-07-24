import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class EntityResolverService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normaliza un texto: mayúsculas, sin tildes, sin caracteres especiales
   */
  private normalizeText(text: string): string {
    if (!text) return '';

    return text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
      .replace(/[^A-Z0-9\s]/g, ' ') // Reemplaza caracteres especiales por espacio
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .trim();
  }

  async resolveProvince(name: string): Promise<string> {
    if (!name) throw new Error('El nombre de la provincia es obligatorio');

    const normalizedName = this.normalizeText(name);

    // Buscar o crear usando upsert (evita duplicados)
    const province = await this.prisma.province.upsert({
      where: { name: normalizedName },
      update: {}, // No actualiza nada, solo lo encuentra
      create: { name: normalizedName },
    });

    return province.id;
  }

  async resolveRecipient(
    idCard: string,
    fullName: string,
    phone?: string,
  ): Promise<string> {
    if (!idCard) throw new Error('El carnet de identidad es obligatorio');

    // Normalizar carnet (solo números y letras mayúsculas)
    const normalizedIdCard = idCard.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Normalizar nombre completo
    const normalizedFullName = this.normalizeText(fullName);

    // Normalizar teléfono (solo números)
    const normalizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

    // Buscar o crear usando upsert
    const recipient = await this.prisma.recipient.upsert({
      where: { idCard: normalizedIdCard },
      update: {
        // Si existe y no tiene teléfono, actualizar
        phone: normalizedPhone || undefined,
        // Opcional: actualizar nombre si cambió
        fullName: normalizedFullName,
      },
      create: {
        idCard: normalizedIdCard,
        fullName: normalizedFullName,
        phone: normalizedPhone || null,
      },
    });

    return recipient.id;
  }
}
