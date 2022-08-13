import {
  AnyInstance, MetadataStorage, Type,
} from 'typereader';

export interface EnvVariableProperties {
  type?: Type,
}

export const EnvVariable = (props?: EnvVariableProperties): PropertyDecorator => (target, propertyKey) => {
  MetadataStorage
    .instance()
    .getClassMetadata<AnyInstance>(target)
    .setProperty(propertyKey, {
      type: props?.type,
      optional: false,
    });
};
