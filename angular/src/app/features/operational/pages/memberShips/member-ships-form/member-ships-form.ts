/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { MembershipsType } from 'src/app/features/parameters/pages/membershipsType/memberships-type';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Vehicle } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-member-ships-form',
  imports: [GenericForm],
  templateUrl: './member-ships-form.html',
  styleUrl: './member-ships-form.scss'
})
export class MemberShipsForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'membershipTypeId',
      label: 'Tipo de Membresía',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un tipo de membresía.' }
      ]
    },
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
      name: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La fecha de inicio es obligatoria.' },
        { name: ValidatorNames.MinDate, validator: ValidatorNames.MinDate, value: new Date().toISOString().split('T')[0], message: 'La fecha de inicio no puede ser anterior a hoy.' }
      ]
    },
    {
      name: 'endDate',
      label: 'Fecha de Fin',
      type: 'date',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La fecha de fin es obligatoria.' }
      ]
    },
    {
      name: 'priceAtPurchase',
      label: 'Precio al Comprar',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El precio es obligatorio.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'El precio debe ser mayor a 0.' }
      ]
    },
    {
      name: 'durationDays',
      label: 'Duración (días)',
      type: 'number',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La duración es obligatoria.' },
        { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'La duración debe ser mayor a 0.' }
      ]
    },
    {
      name: 'currency',
      label: 'Moneda',
      type: 'text',
      required: false,
      validations: [
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 3, message: 'La moneda no puede superar los 3 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[A-Z]{3}$', message: 'La moneda debe ser 3 letras mayúsculas (ej: USD, COP).' }
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

    // Tipos de membresía
    this.service.get<MembershipsType[]>('MemberShipType/select').subscribe({
      next: (items) => {
        this.formConfig = this.formConfig.map(field =>
          field.name === 'membershipTypeId'
            ? { ...field, options: (items || []).map(i => ({ value: i.id, label: i.name })) }
            : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de membresía.', 'error');
      }
    });

    // Vehículos
    this.service.get<Vehicle[]>('Vehicle/select').subscribe({
      next: (items) => {
        this.formConfig = this.formConfig.map(field =>
          field.name === 'vehicleId'
            ? { ...field, options: (items || []).map(i => ({ value: i.id, label: i.plate })) }
            : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los vehículos.', 'error');
      }
    });

    // Modo edición
    if (id) {
      this.isEdit = true;
      this.service.getById<any>('MemberShips', id).subscribe({
        next: (item) => {
          this.initialData = item;
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar la membresía.', 'error');
          this.route.navigate(['/memberShips-index']);
        }
      });
    }
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('MemberShips', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/memberShips-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('MemberShips', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/memberShips-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.route.navigate(['/memberShips-index']);
  }
}
