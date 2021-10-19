import { Parser } from './parser.interface';

export class NumberParser implements Parser<number> {
  parse(value: string): number {
    return parseFloat(value);
  }
}
