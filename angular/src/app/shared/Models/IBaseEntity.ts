// IBaseEntity.ts
// interfaz genérica con los atributos base que todas las entidades comparten
export interface IBaseEntity {
  id: number;
  asset: boolean;
  isDeleted: boolean;
}
