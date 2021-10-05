import { ArrayParser } from './array-parser';
import { Parser } from './parser.interface';

describe('ArrayParser', () => {
  test('should parse array of strings', () => {
    const parse = jest.fn((i) => i);
    const parser = new ArrayParser<string>({
      parse,
    } as unknown as Parser<string>);

    const result = parser.parse('[foo, bar]');
    expect(result).toEqual(['foo', 'bar']);
  });
});
