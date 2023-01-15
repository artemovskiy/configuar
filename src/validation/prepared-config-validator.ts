import Ajv from 'ajv/dist/ajv';
import { ErrorObject, ValidateFunction } from 'ajv/dist/types';
import { ConfigType } from '../metadata/config-type';
import { TypeSchemaGenerator } from '../type-schema-generator/type-schema-generator';

export class PreparedConfigValidator {
  private readonly ajv: Ajv;

  private validateFn: ValidateFunction;

  private readonly typeSchemaGenerator: TypeSchemaGenerator;

  constructor(
    private readonly type: ConfigType,
    private readonly input: any,
  ) {
    this.typeSchemaGenerator = new TypeSchemaGenerator();
    this.ajv = new Ajv();
    this.createValidator();
  }

  private createValidator() {
    const schema = this.typeSchemaGenerator.getSchema(this.type);
    this.validateFn = this.ajv.compile(schema);
  }

  public checkValidationErrors(): null | ErrorObject[] {
    if (this.validateFn(this.input)) {
      return null;
    }
    return this.validateFn.errors;
  }
}
