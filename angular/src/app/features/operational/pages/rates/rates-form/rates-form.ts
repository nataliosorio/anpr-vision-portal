/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RateType } from 'src/app/features/parameters/pages/ratesType/rate-type';
import { VehicleType } from 'src/app/features/parameters/pages/vehicleType/vehicle-type';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Rates } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-rates-form',
  imports: [GenericForm],
  templateUrl: './rates-form.html',
  styleUrl: './rates-form.scss'
})
export class RatesForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'type',
      label: 'Tipo',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El tipo es obligatorio.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El tipo no puede superar los 50 caracteres.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'El tipo debe tener al menos 3 caracteres.' }
      ]
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 70, message: 'El nombre no puede superar los 50 caracteres.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'El nombre debe tener al menos 3 caracteres.' }
      ]
    },
    {
      name: 'amount',
      label: 'Monto',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El monto es obligatorio.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'El monto debe ser mayor a 0.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[0-9]+(\\.[0-9]{1,2})?$', message: 'El monto debe ser un número válido.' }

      ]
    },
    {
      name: 'starHour', // si en tu back es startHour, cámbialo en ambos lados
      label: 'Hora de Inicio',
      type: 'time', // si tu GenericForm soporta 'time', considera usar 'time'
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La hora de inicio es obligatoria.' }
      ]
    },
    {
      name: 'endHour',
      label: 'Hora de Fin',
      type: 'time',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La hora de fin es obligatoria.' }
      ]
    },
    {
      name: 'year',
      label: 'Año',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El año es obligatorio.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 2000, message: 'El año no puede ser menor a 2000.' },
        {
  name: ValidatorNames.Max,
  validator: ValidatorNames.Max,
  value: new Date().getFullYear() + 1,
  message: 'El año no puede ser mayor al próximo año.'
}

      ]
    },
    {
      name: 'ratesTypeId',
      label: 'Tipo de Tarifa',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un tipo de tarifa.' }
      ]
    },
    {
      name: 'typeVehicleId',
      label: 'Tipo de Vehículo',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un tipo de vehículo.' }
      ]
    },
    {
      name: 'asset',
      label: 'Activo',
      type: 'toggle',
      value: true,
      hidden: true
    }
  ];

  isEdit = false;
  initialData: any = {};

  private service = inject(General);
  private loaderService = inject(LoaderService);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    // Configurar visibilidad del toggle según el modo
    this.formConfig = this.formConfig.map(f =>
      f.name === 'asset' ? { ...f, hidden: !this.isEdit } : f
    );

    // Mostrar loader para carga inicial
    this.loaderService.show();

    // Vehículos
    this.service.get<VehicleType[]>('TypeVehicle/select').subscribe({
      next: (items) => {
        this.formConfig = this.formConfig.map(field =>
          field.name === 'typeVehicleId'
            ? {
                ...field,
                options: (items || []).map(item => ({ value: item.id, label: item.name }))
              }
            : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de vehículo.', 'error');
        this.loaderService.hide();
      }
    });

    // Tipos de tarifa
    this.service.get<RateType[]>('RatesType/select').subscribe({
      next: (items) => {
        this.formConfig = this.formConfig.map(field =>
          field.name === 'ratesTypeId'
            ? {
                ...field,
                options: (items || []).map(item => ({ value: item.id, label: item.name }))
              }
            : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de tarifa.', 'error');
        this.loaderService.hide();
      }
    });


    // Edición
    if (this.isEdit && id) {
      this.service.getById<Rates>('Rates', id).subscribe({
        next: (item) => {
          this.initialData = this.normalizeRateData(item);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar la tarifa.', 'error');
          this.route.navigate(['/rates-index']);
          this.loaderService.hide();
        },
        complete: () => this.loaderService.hide()
      });
    } else {
      // Si no es edición, ocultar loader después de cargar los selects
      this.loaderService.hide();
    }
  }

save(data: any) {
  const payload = { ...data };

  // Agregar parkingId automáticamente desde localStorage
  const parkingId = this.service.getParkingId();
  if (parkingId) {
    payload.parkingId = parseInt(parkingId);
  }

  // Solo eliminar ID en creación, mantenerlo en edición
  if (!this.isEdit) {
    delete payload.id;
  }

  // convertir horas a ISO
  if (data.starHour) {
    payload.starHour = this.toIsoDateTime(data.starHour);
  }
  if (data.endHour) {
    payload.endHour = this.toIsoDateTime(data.endHour);
  }

  this.loaderService.show();
  if (this.isEdit) {
    this.service.put('Rates', payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro actualizado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/rates-index']);
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        this.loaderService.hide();
      },
      complete: () => this.loaderService.hide()
    });
  } else {
    this.service.post('Rates', payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro creado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/rates-index']);
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        this.loaderService.hide();
      },
      complete: () => this.loaderService.hide()
    });
  }
}


  cancel() {
    this.route.navigate(['/rates-index']);
  }

  private normalizeRateData(item: any): any {
    const normalized = { ...item };

    // Convertir horas ISO a formato HH:mm para inputs de tipo time
    if (item.starHour) {
      normalized.starHour = this.isoToTimeString(item.starHour);
    }
    if (item.endHour) {
      normalized.endHour = this.isoToTimeString(item.endHour);
    }

    return normalized;
  }

  private isoToTimeString(isoString: string): string {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  private toIsoDateTime(time: string): string | null {
    if (!time) return null;

    try {
      // Si ya viene en formato ISO, devolverlo tal cual
      if (time.includes('T') && time.includes('Z')) {
        return time;
      }

      // Si viene como HH:mm o HH:mm:ss, convertir a ISO
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;

      // Usamos la fecha de hoy como base
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);

      return today.toISOString(); // "2025-10-01T11:02:00.000Z"
    } catch (error) {
      console.error('Error converting time to ISO:', error);
      return null;
    }
  }

}
