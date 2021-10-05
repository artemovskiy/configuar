import { Parser } from './parser.interface';
import { trimQuotes } from '../utils/string-utils';

export class ArrayParser<T> implements Parser<Array<T>> {
  constructor(private readonly itemParser: Parser<T>) {}

  parse(value: string): Array<T> {
    const trimmed = value.trim();
    if (trimmed[0] !== '[' || trimmed[trimmed.length - 1] !== ']') {
      throw new SyntaxError('expected array');
    }
    const items = trimmed
      .substring(1, trimmed.length - 1)
      .split(',')
      .map((i) => i.trim())
      .map(trimQuotes)
      .map((i) => this.itemParser.parse(i));
    return items as unknown as T[];
  }
}
