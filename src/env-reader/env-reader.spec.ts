import EnvReader from './env-reader';

describe('EnvReader', () => {
  test('should get environment variables values', () => {
    process.env.FOO = 'foo value';
    process.env.BAR = 'bar value';
    const read = jest.fn(() => ({
      BAR: 'bar value',
    }));
    const reader = new EnvReader({ read });

    const result = reader.read(['FOO', 'BAR']);

    expect(read).not.toBeCalled();
    expect(result).toEqual({
      FOO: 'foo value',
      BAR: 'bar value',
    });
  });

  test('should call next if some keys were not met', () => {
    process.env.FOO = 'foo value';
    const read = jest.fn(() => ({
      BAR: 'bar value',
    }));
    const reader = new EnvReader({ read });

    const result = reader.read(['FOO', 'BAR']);

    expect(read).toBeCalledWith(['BAR']);
    expect(result).toEqual({
      FOO: 'foo value',
      BAR: 'bar value',
    });
  });

  let processEnv;

  beforeEach(() => {
    processEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = processEnv;
  });
});
