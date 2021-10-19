import { Parser } from './parser.interface';

export class StringParser implements Parser<string> {
  parse(value: string): string {
    return value;
  }
}
