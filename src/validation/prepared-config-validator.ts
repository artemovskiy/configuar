import Ajv from 'ajv';
import { ErrorObject, ValidateFunction } from 'ajv/lib/types';
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
    this.validateFn = this.ajv.compile(this.typeSchemaGenerator.getSchema(this.type));
  }

  public checkValidationErrors(): null | ErrorObject[] {
    if (this.validateFn(this.input)) {
      return null;
    }
    return this.validateFn.errors;
  }
}
