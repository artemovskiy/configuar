import {
  AnyInstance, Type,
} from 'typereader';

import { ConfigMetadataStorage } from './metadata/metadata-storage';
import { ConfigSectionProperties } from './metadata/class-metadata';

export interface EnvVariableProperties {
  type?: Type,
  /**
   * @default false
   */
  optional?: boolean,
}

export const EnvVariable = (props?: EnvVariableProperties): PropertyDecorator => (target, propertyKey) => {
  ConfigMetadataStorage
    .instance()
    .getConfigClassMetadata<AnyInstance>(target)
    .setProperty(propertyKey, {
      type: props?.type,
      optional: props?.optional ?? false,
    });
};

export const Section = (props?: Partial<ConfigSectionProperties>): PropertyDecorator => (target, propertyKey) => {
  const metadata = ConfigMetadataStorage.instance().getConfigClassMetadata<AnyInstance>(target);
  metadata.setProperty(propertyKey, { type: undefined, optional: false });
  metadata.setSection(propertyKey, (props?.prefix) ?? null);
};
