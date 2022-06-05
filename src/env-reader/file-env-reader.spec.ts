import * as mockFs from 'mock-fs';

import { FileEnvReader } from './file-env-reader';

describe('FileEnvReader', () => {
  beforeAll(() => {
    mockFs({
      './config/.env': `
FOO=foo value
BAR=bar value
`,
      '.env': `
FOO=foo cwd value
`,
      './config/partial.env': `
FOO=foo value
`,
    });
  });

  test('should get environment variables values', () => {
    const read = jest.fn(() => ({}));
    const reader = new FileEnvReader({ dir: './config' }, { read });

    const result = reader.read(['FOO', 'BAR']);

    expect(read).not.toBeCalled();
    expect(result).toEqual({
      FOO: 'foo value',
      BAR: 'bar value',
    });
  });

  test('should read cwd()/.env file by default', () => {
    const reader = new FileEnvReader({});

    const result = reader.read(['FOO']);

    expect(result).toEqual({
      FOO: 'foo cwd value',
    });
  });

  test('should call next if some keys were not met', () => {
    const read = jest.fn(() => ({
      BAR: 'bar value',
    }));
    const reader = new FileEnvReader(
      { dir: './config', filename: 'partial.env' },
      { read },
    );

    const result = reader.read(['FOO', 'BAR']);

    expect(read).toBeCalledWith(['BAR']);
    expect(result).toEqual({
      FOO: 'foo value',
      BAR: 'bar value',
    });
  });

  test('should call next if no .env exists', () => {
    const read = jest.fn(() => ({
      BAR: 'bar value',
    }));

    const reader = new FileEnvReader(
      { dir: './config', filename: 'not-exists.env' },
      { read },
    );

    const result = reader.read(['FOO', 'BAR']);

    expect(read).toBeCalledWith(['FOO', 'BAR']);
    expect(result).toEqual({
      BAR: 'bar value',
    });
  });
});
