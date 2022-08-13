import { ClassType } from 'typereader';
import { ParserFactory } from './parser-factory.interface';
import { Parser } from './parser';

export default class ConfigMapper<TConfig> {
  constructor(
    private readonly type: ClassType,
    private readonly parserFactory: ParserFactory,
  ) {}

  getEnvKeys() {
    return this.type.getProperties()
      .map((p) => p.name)
      .filter((i) => typeof i === 'string')
      .map((i: string) => this.getEnvVariableName(i));
  }

  map(input: Record<string, string>): TConfig {
    return this.type.getProperties().reduce((acc, property) => {
      if (typeof property.name === 'symbol') {
        return acc;
      }

      const inputKey = this.getEnvVariableName(property.name);
      const inputValue = input[inputKey];

      let parser: Parser<unknown>;
      try {
        parser = this.parserFactory.createParser(property.type);
      } catch (e) {
        throw new Error(`Can not create parser for property: ${property.name}: ${e}`);
      }
      const parsedValue = parser.parse(inputValue);
      return {
        ...acc,
        [property.name]: parsedValue,
      };
    }, {}) as TConfig;
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
