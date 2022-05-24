import 'reflect-metadata';
import {METADATA_KEYS} from "./constants";
import {mapObjIndexed} from "../utils";
import {ArrayCtor, TypedArray} from "./array";
import {Constructor, Schema} from "./types";

export class ClassSchemaReader<T> {

  constructor(
    private readonly classCtor: Constructor<T>,
  ) {
  }

  read(): Schema<T> {
    const ref = Reflect.getMetadata(METADATA_KEYS.VARIABLES, this.classCtor);

    return mapObjIndexed((type: Constructor) => {
      const isArrayType = type.prototype === TypedArray.prototype;
      return {
        ctor: type,
      }
    }, ref) as Schema<T>
  }
}