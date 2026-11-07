import { randomBytes } from 'crypto';

export function publicReference(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`;
}
