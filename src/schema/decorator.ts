import {METADATA_KEYS} from "./constants";
import {Constructor} from "./types";

export interface EnvVariableProperties {
  type?: Constructor,
}

export const EnvVariable = (props?: EnvVariableProperties): PropertyDecorator =>
  (target, propertyKey) => {
  const type = props?.type ?? Reflect.getMetadata("design:type", target, propertyKey);
  const attributes = Reflect.getMetadata(METADATA_KEYS.VARIABLES, target.constructor) || {};
  Reflect.defineMetadata(
    METADATA_KEYS.VARIABLES,
    { ...attributes, [propertyKey]: type },
    target.constructor,
  );
}