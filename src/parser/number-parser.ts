import { Parser } from './parser.interface';

export default class NumberParser implements Parser<number> {
  parse(value: string): number {
    return parseFloat(value);
  }
}
