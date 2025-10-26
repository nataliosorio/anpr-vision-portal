/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { Parking } from 'src/app/features/parameters/pages/parking/parking';
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
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El tipo no puede superar los 50 caracteres.' }
      ]
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 70, message: 'El nombre no puede superar los 70 caracteres.' }
      ]
    },
    {
      name: 'amount',
      label: 'Monto',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El monto es obligatorio.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'El monto debe ser mayor a 0.' }
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
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 2000, message: 'El año no puede ser menor a 2000.' }
      ]
    },
    {
      name: 'parkingId',
      label: 'Parqueadero',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un parqueadero.' }
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
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

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
      }
    });

    // Parqueaderos
    this.service.get<Parking[]>('Parking/select').subscribe({
      next: (items) => {
        this.formConfig = this.formConfig.map(field =>
          field.name === 'parkingId'
            ? {
                ...field,
                options: (items || []).map(item => ({ value: item.id, label: item.name }))
              }
            : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los parqueaderos.', 'error');
      }
    });

    // Edición
    if (id) {
      this.isEdit = true;
      this.service.getById<Rates>('Rates', id).subscribe({
        next: (item) => {
          this.initialData = item;
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar la tarifa.', 'error');
          this.route.navigate(['/rates-index']);
        }
      });
    }
  }

save(data: any) {
  const payload = { ...data };
  delete payload.id;

  // convertir horas a ISO
  if (data.starHour) {
    payload.starHour = this.toIsoDateTime(data.starHour);
  }
  if (data.endHour) {
    payload.endHour = this.toIsoDateTime(data.endHour);
  }

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
      }
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
      }
    });
  }
}


  cancel() {
    this.route.navigate(['/rates-index']);
  }

  private toIsoDateTime(time: string): string | null {
  if (!time) return null;

  // Usamos la fecha de hoy como base
  const today = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  today.setHours(hours, minutes, 0, 0);

  return today.toISOString(); // "2025-10-01T11:02:00.000Z"
}

}
