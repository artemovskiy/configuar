import { ErrorObject } from 'ajv/dist/ajv';
import { ConfigType } from '../metadata/config-type';

export interface ValidationError {
  envKey: string;
  keyword: string;
  message: string;
}

export interface TranslatesError {
  translate(original: ErrorObject): ValidationError
}

export class ErrorTranslator implements TranslatesError {
  constructor(private readonly type: ConfigType) {
  }

  translate(original: ErrorObject): ValidationError {
    if (original.instancePath === '') {
      if (original.keyword === 'required') {
        const { missingProperty } = original.params;
        const property = this.type.getProperty(missingProperty);
        if (typeof property.name === 'symbol') {
          throw new TypeError();
        }
        const envVariableName = this.getEnvVariableName(property.name);
        return {
          envKey: envVariableName,
          keyword: original.keyword,
          message: `'${envVariableName}' ${this.getErrorMessageByKeyword(original.keyword)}`,
        };
      }
      throw new Error(`Unexpected error keyword: ${original.keyword}`);
    }
    const nestingLevels = original.instancePath.substring(1).split('/');
    const sectionPath = nestingLevels.shift();
    const section = this.type.sections.find((s) => s.name === sectionPath);
    if (!section) {
      throw new TypeError(`Section not found by path: ${sectionPath}.`);
    }
    const sectionTranslator = new ErrorTranslator(this.type.getProperty(section.name).type as ConfigType);
    const translatedError = sectionTranslator.translate({
      ...original,
      instancePath: nestingLevels.length > 0 ? `/${nestingLevels.join('/')}` : '',
    });
    const envKey = (section.prefix ?? '') + translatedError.envKey;
    return {
      envKey,
      keyword: translatedError.keyword,
      message: `'${envKey}' ${this.getErrorMessageByKeyword(original.keyword)}`,
    };
  }

  private getErrorMessageByKeyword(keyword: string): string {
    switch (keyword) {
      case 'required': {
        return 'has to be defined';
      }
      default: {
        return 'something is wrong';
      }
    }
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
