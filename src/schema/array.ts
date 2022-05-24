import { Constructor } from './types';

export type ArrayCtor<T = any> = {
  new (items: T[]): Array<T>,
  new (length?: number): Array<T>,
  itemCtor: Constructor<T>
};

export class TypedArray extends Array {

}

const repository = new Map<Constructor, Constructor>();

export const isTypedArrayConstructor = (ctor: Constructor<any>): ctor is ArrayCtor => typeof ctor === 'function'
  && 'itemCtor' in ctor
  // eslint-disable-next-line @typescript-eslint/dot-notation
  && typeof ctor['itemCtor'] === 'function';

export const ArrayOf = (itemType: new (...args: any[]) => any): Constructor => {
  if (repository.has(itemType)) {
    return repository.get(itemType);
  }

  // eslint-disable-next-line func-names
  const ctor = function (...args: any[]) {
    return new TypedArray(...args);
  } as unknown as Constructor;

  repository.set(itemType, ctor);

  ctor.prototype = TypedArray.prototype;
  Object.defineProperty(ctor, 'name', { value: `Array<${itemType.name}>` });
  Object.defineProperty(ctor, 'itemCtor', { value: itemType });

  return ctor;
};
