import { TypeKind } from 'typereader';
import { ParserFactory } from './parser-factory.interface';
import { Parser } from './parser';
import { ConfigType } from './metadata/config-type';
import { ConfigSection } from './metadata/config-section';

type SchemaMappers<TConfig> = Array<[ConfigSection, ConfigMapper<TConfig[ keyof TConfig]>]>;

export default class ConfigMapper<TConfig> {
  constructor(
    private readonly type: ConfigType,
    private readonly parserFactory: ParserFactory,
  ) {
  }

  private schemaMappers: SchemaMappers<TConfig>;

  private getSchemaMappers(): SchemaMappers<TConfig> {
    if (!this.schemaMappers) {
      this.schemaMappers = this.createSectionMappers();
    }

    return this.schemaMappers;
  }

  private createSectionMappers(): SchemaMappers<TConfig> {
    return this.type.sections
      .map((section) => {
        const property = this.type.getProperty(section.name);
        return [section, new ConfigMapper(
          new ConfigType(property.type.as(TypeKind.Class), []),
          this.parserFactory,
        )];
      });
  }

  getEnvKeys() {
    const sections = this.getSchemaMappers()
      .map(([section, sectionMapper]) => sectionMapper.getEnvKeys().map((i: string) => (section.prefix ?? '') + i))
      .flat();

    const configSectionNames = this.type.sections.map((i) => i.name);

    const flatProperties = this.type.getProperties()
      .map((p) => p.name)
      .filter((i) => typeof i === 'string' && !configSectionNames.includes(i))
      .map((i: string) => this.getEnvVariableName(i));
    return [...flatProperties, ...sections];
  }

  map(input: Record<string, string>): TConfig {
    const obj = {
      ...this.mapFlatProperties(input),
      ...this.mapSections(input),
    } as unknown as TConfig;
    return Object.assign(Object.create(this.type.getConstructorReference().prototype), obj);
  }

  private mapSections(input: Record<string, string>): Partial<TConfig> {
    return this.getSchemaMappers()
      .map(([section, sectionMapper]) => {
        if (section.prefix !== null) {
          const sectionInput: Record<string, string> = {};
          for (const key of Object.keys(input)) {
            if (key.startsWith(section.prefix)) {
              sectionInput[key.slice(section.prefix.length)] = input[key];
            }
          }
          return { [section.name]: sectionMapper.map(sectionInput) };
        }
        return { [section.name]: sectionMapper.map(input) };
      })
      .reduce(
        (acc: Record<string, any>, item: Record<string, Record<string, any>>) => ({ ...acc, ...item }),
        {},
      ) as unknown as Partial<TConfig>;
  }

  private mapFlatProperties(input: Record<string, string>): Partial<TConfig> {
    const sections = this.type.sections.map((i) => i.name);
    return this.type.getProperties()
      .filter((property) => typeof property.name === 'symbol' || !sections.includes(property.name))
      .reduce((acc, property) => {
        if (typeof property.name === 'symbol') {
          return acc;
        }

        const inputKey = this.getEnvVariableName(property.name);
        const inputValue = input[inputKey];
        if (inputValue === undefined) {
          return acc;
        }

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
      }, {});
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
