/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Vehicle } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-black-list-form',
  imports: [GenericForm],
  templateUrl: './black-list-form.html',
  styleUrl: './black-list-form.scss'
})
export class BlackListForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'vehicleId',
      label: 'Vehículo',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un vehículo.' }
      ]
    },
    {
      name: 'reason',
      label: 'Razón',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La razón es obligatoria.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'La razón debe tener al menos 3 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 100, message: 'La razón no puede exceder los 100 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'La razón solo puede contener letras y espacios.' }
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

    // Cargar vehículos para el select
    this.service.get<Vehicle[]>('Vehicle/select').subscribe({
      next: (vehicles) => {
        const options = (vehicles || []).map(v => ({
          value: v.id,
          label: v.plate
        }));
        this.formConfig = this.formConfig.map(f =>
          f.name === 'vehicleId' ? { ...f, options } : f
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los vehículos.', 'error');
      }
    });

    // Modo edición: cargar registro
    if (this.isEdit && id) {
      this.service.getById<any>('BlackList', id).subscribe({
        next: (bl) => {
          this.initialData = this.normalizeBlackList(bl);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el registro.', 'error');
          this.router.navigate(['/blackList-index']);
        }
      });
    }
  }

  private normalizeBlackList(bl: any) {
    return {
      id: bl.id,
      vehicleId: bl.vehicleId ?? bl.vehicle?.id ?? null,
      reason: bl.reason,
      restrictionDate: bl.restrictionDate, // solo lectura; no está en el form
      asset: bl.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('BlackList', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/blackList-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;
      delete payload.restrictionDate; // el back la setea

      this.service.post('BlackList', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/blackList-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/blackList-index']);
  }
}
