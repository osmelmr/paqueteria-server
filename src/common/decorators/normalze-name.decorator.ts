// common/decorators/normalize-name.decorator.ts
import { Transform } from 'class-transformer';
import { normalizeText } from '../utils/normalize-text.js';

export function NormalizeName() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return normalizeText(value);
    }
    return value as string;
  });
}
