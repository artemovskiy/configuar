import { ClassType } from 'typereader';
import { ConfigSection } from './config-section';

export class ConfigType extends ClassType {
  constructor(classType: ClassType, public readonly sections: ConfigSection[]) {
    super(classType.getProperties(), classType.getConstructorReference());
  }
}
