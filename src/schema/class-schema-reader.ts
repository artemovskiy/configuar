import 'reflect-metadata';
import { METADATA_KEYS } from './constants';
import { mapObjIndexed } from '../utils';
import { Constructor, Schema } from './types';

export default class ClassSchemaReader<T> {
  constructor(
    private readonly classCtor: Constructor<T>,
  ) {
  }

  read(): Schema<T> {
    const ref = Reflect.getMetadata(METADATA_KEYS.VARIABLES, this.classCtor);

    return mapObjIndexed((type: Constructor) => ({
      ctor: type,
    }), ref) as Schema<T>;
  }
}
