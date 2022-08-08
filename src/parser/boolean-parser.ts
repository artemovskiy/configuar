import { Parser } from './parser.interface';
import { isNullish } from '../utils';

export default class BooleanParser implements Parser<boolean> {
  parse(value: string): boolean | null {
    if (isNullish(value)) {
      return null;
    }
    const trimmed = value.trim();

    switch (trimmed) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw new Error(`Invalid value '${trimmed}' for boolean. Expected 'true' of 'false'`);
    }
  }
}
