import { ClassMetadata, AnyInstance } from 'typereader';
import 'reflect-metadata';

const keyToString = (key: string | symbol | number): string => {
  if (typeof key === 'number') {
    return key.toString(10);
  }
  if (typeof key === 'symbol') {
    return key.toString();
  }
  return key;
};

export interface ConfigSectionProperties {
  prefix: string | null;
}

export class ConfigClassMetadata<T extends AnyInstance> extends ClassMetadata<T> {
  private static readonly SECTIONS: 'configuar/sections';

  setSection<K extends keyof T>(name: K, prefix: string) {
    const sections = Reflect.getMetadata(ConfigClassMetadata.SECTIONS, this.prototype) || {};
    if (sections[name] !== undefined) {
      throw new TypeError(`Section ${keyToString(name)} already defined on ${this.prototype.constructor.name}`);
    }
    Reflect.defineMetadata(ConfigClassMetadata.SECTIONS, {
      ...sections,
      [name]: { prefix },
    }, this.prototype);
  }

  getSections(): { [P in keyof T]: ConfigSectionProperties } {
    return Reflect.getMetadata(ConfigClassMetadata.SECTIONS, this.prototype) || {};
  }
}
