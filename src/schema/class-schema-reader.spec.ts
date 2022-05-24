import ClassSchemaReader from './class-schema-reader';
import { EnvVariable } from './decorator';
import { ArrayOf } from './array';

describe('ClassSchemaReader', () => {
  test('should read properties of a plain class', () => {
    class Region {
      @EnvVariable()
      populationSize: number;

      @EnvVariable()
      name: string;

      @EnvVariable()
      autonomy: boolean;

      @EnvVariable({
        type: ArrayOf(Number),
      })
      grzNumbers: number[];

      @EnvVariable({
        type: ArrayOf(String),
      })
      nations: string[];
    }

    const reader = new ClassSchemaReader(Region);
    const schema = reader.read();

    expect(schema).toStrictEqual({
      populationSize: { ctor: Number },
      name: { ctor: String },
      autonomy: { ctor: Boolean },
      grzNumbers: { ctor: ArrayOf(Number) },
      nations: { ctor: ArrayOf(String) },
    });
  });
});
