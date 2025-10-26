/* eslint-disable @typescript-eslint/no-explicit-any */
// Entities.ts
import { IBaseEntity } from "./IBaseEntity";
import { IEntity } from "./IEntity";

// entidades que no necesitan atributos extra
export type Form = IEntity;
export type Module = IEntity;
export type Role = IEntity;
export type Permission = IEntity;

// entidades que sí necesitan atributos extra
export interface Person extends IBaseEntity {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  document: string;
  phone: string;
  age: number;
}

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  password: string;
  personid: number;
  personname?: string;
}



export interface FormModule extends IBaseEntity {
  formId: number;
  moduleId: number;
  formName: string;
  moduleName: string;
}

export interface User extends IBaseEntity {
  username: string;
  email: string;
  password: string;
  personId: number;
  personName: string;
}

export interface Vehicle extends IBaseEntity {
  plate: string;
  color: string;
  typeVehicleId: number;
  clientId: number;
  client: string;
  typeVehicle: string;
}

export interface Client extends IBaseEntity {
  personId: number;
  person: string;
  name: string;
}

export interface RegisteredVehicle extends IBaseEntity {
entryDate: string; // ISO 8601 format date string
exitDate: string | null; // ISO 8601 format date string or null
vehicleId: number;
vehicle: string;
slotsId: number;
slots: string;
}

export interface BlackList extends IBaseEntity {
  vehicleId: number;
  vehicle: string;
  reason: string;
  restrictionDate: string; // ISO 8601 format date string
}

export interface Camera extends IBaseEntity {
  name: string;
  resolution: string;
  url: string;
   parkingId: number;
  parking: string;
}

export interface MemberShips extends IBaseEntity {
startDate: string; // ISO 8601 format date string
EndDate: string; // ISO 8601 format date string or null
priceAtPurchase: number;
durationDays: number;
currency: string;
membershipTypeId: number;
membershipType: string;
vehicleId: number;
vehicle: string;
}

export interface Rates extends IBaseEntity {
type: string;
amount: number;
starHour: string; // ISO 8601 format date string
endHour: string; // ISO 8601 format date string
year: number;
parkingId: number;
ratesTypeId: number;
typeVehicleId: number;
ratesType: string;
typeVehicle: string;
parking: string;
name: string;
}


export interface TotalResponse {
  data: { total: number };
  success: boolean;
  message: string;
  details: any;
}

export interface DashboardCard {
  id: string;
  background: string;
  title: string;
  icon: string;
  number: number | string;   // 👈 importante
}
export interface TotalEnvelope { data?: { total?: number }; total?: number }
export interface OccupancyEnvelope {
  data?: { occupied?: number; total?: number; percentage?: number; free?: number };
  occupied?: number; total?: number; percentage?: number; free?: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;           // Ejemplo: "Info", "Warning", "Success"
  isRead: boolean;
  relatedEntityId?: number; // opcional
  parkingId: number;
  createdAt?: string;       // si en el backend añadimos fecha
}

