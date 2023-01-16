import { TypeKind } from 'typereader';
import { JSONSchema6 } from 'json-schema';
import { ConfigType } from '../metadata/config-type';
import { ConfigSection } from '../metadata/config-section';
import { TypeSchemaGenerator } from '../type-schema-generator/type-schema-generator';
import { mergeObjectSchemasRight, prefixObjectKeys } from './jsonschema-utils';

export class SchemaGenerator {
  private readonly schemaGenerator: TypeSchemaGenerator;

  constructor(
    private readonly type: ConfigType,
  ) {
    this.schemaGenerator = new TypeSchemaGenerator();
  }

  getInputObjectSchema(): JSONSchema6 {
    return mergeObjectSchemasRight(
      this.getFlatPropertiesSchema(),
      this.getSectionsSchema(),
    );
  }

  private getSectionsSchema(): JSONSchema6 {
    const sectionGenerators: Array<[ConfigSection, SchemaGenerator]> = this.type.sections.map((section) => {
      const property = this.type.getProperty(section.name);
      const generator = new SchemaGenerator(new ConfigType(property.type.as(TypeKind.Class), []));
      return [section, generator];
    });

    return sectionGenerators
      .map(([section, sectionGenerator]) => {
        const sectionSchema = sectionGenerator.getInputObjectSchema();
        if (section.prefix) {
          return prefixObjectKeys(section.prefix, sectionSchema);
        }
        return sectionSchema;
      })
      .reduce<JSONSchema6>(
      (acc, item) => mergeObjectSchemasRight(acc, item),
      {
        type: 'object',
        properties: {},
        required: [],
      },
    ) as unknown as JSONSchema6;
  }

  private getFlatPropertiesSchema(): JSONSchema6 {
    return this.getFlatProperties()
      .reduce<JSONSchema6>((acc, property) => {
      if (typeof property.name === 'symbol') {
        return acc;
      }

      const inputKey = this.getEnvVariableName(property.name);

      const newProperties = {
        ...acc.properties,
        [inputKey]: this.schemaGenerator.getSchema(property.type),
      };

      const newRequired = property.optional ? acc.required : [...acc.required, inputKey];

      return {
        ...acc,
        properties: newProperties,
        required: newRequired,
      };
    }, {
      type: 'object',
      properties: {},
      required: [],
    });
  }

  private getFlatProperties() {
    const sections = this.type.sections.map((i) => i.name);
    return this.type.getProperties()
      .filter((property) => typeof property.name === 'symbol' || !sections.includes(property.name));
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
