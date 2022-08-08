import BooleanParser from './boolean-parser';

describe('BooleanParser', () => {
  let parser: BooleanParser;

  beforeEach(() => {
    parser = new BooleanParser();
  });

  test('should parse \'true\' value', () => {
    const result = parser.parse('true');
    expect(result).toEqual(true);
  });

  test('should parse \'false\' value', () => {
    const result = parser.parse('false');
    expect(result).toEqual(false);
  });

  test.each([
    ['falsy'], ['0'], ['1'], ['undefined'],
  ])('should throw if values is not a valid boolean, but %s', (value: string) => {
    expect(() => { parser.parse(value); })
      .toThrow(`Invalid value '${value}' for boolean. Expected 'true' of 'false'`);
  });

  test('should return null for empty input', () => {
    const result = parser.parse(undefined);
    expect(result).toEqual(null);
  });
});
