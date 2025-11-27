export interface VehicleValidationRequestDto {
  plate: string;
  parkingId: number;
}

export interface VehicleValidationResultDto {
  exists: boolean;
  isBlacklisted: boolean;
  hasActiveEntry: boolean;
  typeVehicleId?: number;
  clientName?: string;
  vehicleColor?: string;
  message: string;
}
