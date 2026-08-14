// common/decorators/normalize-name.decorator.ts
import { Transform } from 'class-transformer';

export function NormalizeName() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      // 1. Normalizar a NFD: "camagüey" → "camaguey" (con diéresis separada)
      let normalized = value.normalize('NFD');
      // 2. Eliminar los caracteres diacríticos (tildes, diéresis, etc.)
      normalized = normalized.replace(/[\u0300-\u036f]/g, '');
      // 3. Sustituir Ñ por N en vez de eliminarla
      normalized = normalized.replace(/Ñ/g, 'N');
      // 4. Eliminar cualquier otro símbolo que no sea letra, número o espacio
      normalized = normalized.replace(/[^a-zA-Z0-9\s]/g, '');
      // 5. Limpiar espacios y pasar a mayúsculas
      return normalized.trim().replace(/\s+/g, ' ').toUpperCase();
    }
    return value as string;
  });
}
