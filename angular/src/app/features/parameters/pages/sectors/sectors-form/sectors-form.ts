/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { Zones } from '../../zones/zones';
import { VehicleType } from '../../vehicleType/vehicle-type';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-sectors-form',
  imports: [GenericForm],
  templateUrl: './sectors-form.html',
  styleUrl: './sectors-form.scss'
})
export class SectorsForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'El nombre debe tener al menos 3 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El nombre no puede exceder los 50 caracteres.' },
        // { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
      ]
    },
    {
      name: 'capacity',
      label: 'Capacidad',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La capacidad es obligatoria.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'La capacidad debe ser al menos 1.' },
        { name: ValidatorNames.Max, validator: ValidatorNames.Max, value: 10000, message: 'La capacidad no puede ser mayor a 10,000.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[0-9]+$', message: 'La capacidad solo puede contener números enteros.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[1-9][0-9]{0,3}$', message: 'La capacidad debe ser un número válido entre 1 y 9999.' },
      ]
    },
    {
      name: 'zonesId',
      label: 'Zona a la que pertenece',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar una zona.' }
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
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    // Cargar selects en paralelo y, si es edición, el sector
    const selects$ = forkJoin({
      zones: this.service.get<Zones[]>('Zones/select').pipe(
        catchError((err: Error) => {
          Swal.fire('Error', err.message || 'No se pudieron cargar las zonas.', 'error');
          return of<Zones[]>([]);
        })
      ),
      types: this.service.get<VehicleType[]>('TypeVehicle/select').pipe(
        catchError((err: Error) => {
          Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de vehículo.', 'error');
          return of<VehicleType[]>([]);
        })
      )
    }).pipe(
      map(({ zones, types }) => {
        // Inyectar opciones en formConfig
        this.formConfig = this.formConfig.map(field => {
          if (field.name === 'zonesId') {
            return {
              ...field,
              options: zones.map(z => ({ value: z.id, label: z.name }))
            };
          }
          if (field.name === 'typeVehicleId') {
            return {
              ...field,
              options: types.map(t => ({ value: t.id, label: t.name }))
            };
          }
          return field;
        });
        return true;
      })
    );

    if (this.isEdit && id) {
      selects$.pipe(
        switchMap(() =>
          this.service.getById<any>('Sectors', id).pipe(
            catchError((err: Error) => {
              Swal.fire('Error', err.message || 'No se pudo cargar el sector.', 'error');
              return of(null);
            })
          )
        )
      ).subscribe((sector) => {
        if (sector) {
          this.initialData = this.normalizeSector(sector);
        }
      });
    } else {
      // Solo selects (crear)
      selects$.subscribe();
    }
  }

  private normalizeSector(sector: any) {
    // Normaliza posibles formas del DTO para que encaje con el form
    return {
      id: sector.id,
      name: sector.name,
      capacity: sector.capacity,
      zonesId: sector.zonesId ?? sector.zones?.id ?? sector.zoneId ?? null,
      typeVehicleId: sector.typeVehicleId ?? sector.typeVehicle?.id ?? sector.vehicleTypeId ?? null,
      asset: sector.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('Sectors', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/sectors-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('Sectors', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/sectors-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/sectors-index']);
  }
}
