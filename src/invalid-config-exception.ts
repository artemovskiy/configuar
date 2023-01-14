import { ErrorObject } from 'ajv';

export class InvalidConfigException extends Error {
  constructor(
    private readonly errors: ErrorObject[],
  ) {
    super(errors.map((e) => e.message).join(', '));
  }
}
