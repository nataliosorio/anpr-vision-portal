// IEntity.ts
import { IBaseEntity } from "./IBaseEntity";

// interfaz que hereda de IBaseEntity y agrega atributos comunes
export interface IEntity extends IBaseEntity {
  name: string;
  description: string;
}
