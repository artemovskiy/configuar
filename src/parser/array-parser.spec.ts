import { ArrayParser } from './array-parser';
import * as R from 'ramda';
import { Parser } from './parser.interface';

describe('ArrayParser', () => {
  test('should parse array of strings', () => {
    const parse = jest.fn(R.identity);
    const parser = new ArrayParser<string>({ parse } as unknown as Parser<string>);

    const result = parser.parse('[foo, bar]');
    expect(result).toEqual(['foo', 'bar']);
  });
});
