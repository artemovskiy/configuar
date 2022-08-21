/* eslint-disable no-underscore-dangle */
import { ConfigClassMetadata } from './class-metadata';

// eslint-disable-next-line import/prefer-default-export
export class ConfigMetadataStorage {
  private static _instance: ConfigMetadataStorage;

  public static instance() {
    if (!this._instance) {
      this._instance = new this();
    }

    return this._instance;
  }

  getConfigClassMetadata<T>(prototype: unknown) {
    return new ConfigClassMetadata<T>(prototype);
  }
}
