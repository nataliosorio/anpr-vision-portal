/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { ParkingCtegory } from '../../parkingCategory/parking-ctegory';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-parking-form',
  imports: [GenericForm],
  templateUrl: './parking-form.html',
  styleUrl: './parking-form.scss'
})
export class ParkingForm implements OnInit {
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
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
      ]
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La ubicación es obligatoria.' },
        {
          name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'La ubicación debe tener al menos 3 caracteres.'
        },
        {
          name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 100, message: 'La ubicación no puede tener más de 100 caracteres.'
        },
        {
          name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ0-9\\s,.-]{3,100}$', message: 'La ubicación solo puede contener letras, números, espacios, comas, puntos y guiones.'
        },
        {
          name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^(?!\\s*$).+', message: 'La ubicación no puede estar vacía o contener solo espacios.'
        }
      ]
    },
    {
      name: 'parkingCategoryId',
      label: 'Categoría del Parqueadero',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar una categoría.' }
      ]
    },
    {
      name: 'asset',
      label: 'Activo',
      type: 'toggle',
      value: true,
      hidden: true   // <-- Esto lo mantiene oculto
    }
  ];

  isEdit = false;
  initialData: any = {};

  private service = inject(General);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    // Cargar categorías de parqueadero
    this.service.get<{ data: ParkingCtegory[] }>('ParkingCategory/select')
      .subscribe(response => {
        if (response.data) {
          this.formConfig = this.formConfig.map(field => {
            if (field.name === 'parkingCategoryId') {
              return {
                ...field,
                options: response.data.map(item => ({
                  value: item.id,
                  label: item.name
                }))
              };
            }
            return field;
          });
        }
      });

    if (id) {
      this.isEdit = true;
      this.service.getById<{ success: boolean; data: any }>('Parking', id)
        .subscribe(response => {
          if (response.success) {
            this.initialData = response.data;
          }
        });
    }
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('Parking', data).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Registro actualizado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/parking-index']);
      });
    } else {
      delete data.id;
      this.service.post('Parking', data).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Registro creado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/parking-index']);
      });
    }
  }

  cancel() {
    this.route.navigate(['/parking-index']);
  }
}
