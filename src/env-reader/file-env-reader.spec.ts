import * as path from 'path';
import * as process from 'process';
import { FileEnvReader } from './file-env-reader';

describe('FileEnvReader', () => {
  test('should get environment variables values', () => {
    const read = jest.fn(() => ({}));
    const reader = new FileEnvReader({ dir: path.join(process.cwd(), 'test/fixtures/complete') }, { read });

    const result = reader.read(['FOO', 'BAR']);

    expect(read).not.toBeCalled();
    expect(result).toEqual({
      FOO: 'foo value',
      BAR: 'bar value',
    });
  });

  test('should call next if some keys were not met', () => {
    const read = jest.fn(() => ({
      BAR: 'bar value',
    }));
    const reader = new FileEnvReader(
      { dir: path.join(process.cwd(), 'test/fixtures/partial') },
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
