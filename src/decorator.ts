import {
  AnyInstance, Type,
} from 'typereader';

import { ConfigMetadataStorage } from './metadata/metadata-storage';

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

export interface SectionOptions {
  prefix?: string;
  /**
   * @default false
   */
  optional?: boolean;
}
export const Section = (props?: SectionOptions): PropertyDecorator => (target, propertyKey) => {
  const metadata = ConfigMetadataStorage.instance().getConfigClassMetadata<AnyInstance>(target);
  metadata.setProperty(propertyKey, { type: undefined, optional: props?.optional ?? false });
  metadata.setSection(propertyKey, (props?.prefix) ?? null);
};
