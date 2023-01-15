import { ValidationError } from './validation/error-translator';

export class InvalidConfigException extends Error {
  constructor(
    private readonly errors: ValidationError[],
  ) {
    super(errors.map((e) => e.message).join(', '));
  }
}
