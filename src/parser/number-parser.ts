import { Parser } from './parser.interface';

export default class NumberParser implements Parser<number> {
  parse(value: string): number {
    if (value === undefined) {
      return undefined;
    }
    return parseFloat(value);
  }
}
