import { Parser } from './parser.interface';

export default class StringParser implements Parser<string> {
  parse(value: string): string {
    return value;
  }
}
