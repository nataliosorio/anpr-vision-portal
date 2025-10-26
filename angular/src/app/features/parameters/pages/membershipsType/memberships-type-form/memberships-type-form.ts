/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MembershipsType } from '../memberships-type';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-memberships-type-form',
  imports: [GenericForm],
  templateUrl: './memberships-type-form.html',
  styleUrl: './memberships-type-form.scss'
})
export class MembershipsTypeForm implements OnInit {
  formConfig: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
    validations: [
      { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
      { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'El nombre debe tener al menos 3 caracteres.' },
      { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 25, message: 'El nombre no puede exceder los 25 caracteres.' },
      { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
    ]
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'text',
    required: true,
    validations: [
      { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La descripción es obligatoria.' },
      { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 5, message: 'La descripción debe tener al menos 5 caracteres.' },
      { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 200, message: 'La descripción no puede exceder los 200 caracteres.' },
      { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$', message: 'Solo se permiten letras y espacios.' },
    ]
  },
  {
    name: 'durationDaysBase',
    label: 'Duración(días)',
    type: 'number',
    required: true,
    validations: [
      { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La duración es obligatoria.' },
      { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 1, message: 'La duración debe ser al menos 1 día.' },
      { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^(?=.*[0-9]).+$', message: 'Debe contener al menos un número.' },
      { name: ValidatorNames.Max, validator: ValidatorNames.Max, value: 365, message: 'La duración debe ser al menos 1 día.' },
    ]
  },
  {
    name: 'priceBase',
    label: 'Precio',
    type: 'number',
    required: true,
    validations: [
      { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El precio es obligatorio.' },
      { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 0, message: 'El precio no puede ser negativo.' },
      { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El precio es obligatorio.' },
      { name: ValidatorNames.Min, validator: ValidatorNames.Min, value: 0.01, message: 'El precio debe ser mayor que 0.' },
      { name: ValidatorNames.Max, validator: ValidatorNames.Max, value: 9999999.99, message: 'El precio no puede superar 9,999,999.99.' },
      { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[0-9]+(\\.[0-9]{1,2})?$', message: 'El precio debe tener máximo 2 decimales.' }
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

  constructor() {
  }

  ngOnInit(): void {
  const id = this.activatedRoute.snapshot.paramMap.get('id');
  if (id) {
    this.isEdit = true;
    this.service.getById<{ success: boolean; data: MembershipsType }>('MemberShipType', id).subscribe(response => {
      if (response.success) {
           this.initialData = response.data;

      }
    });
  }
}


  save(data: any) {
    if (this.isEdit) {
      this.service.put('MemberShipType', data).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Registro actualizado exitosamente',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      this.route.navigate(['/memberShipType-index']);
    });
    } else {
       delete data.id;
    this.service.post('MemberShipType', data).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Registro creado exitosamente',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      this.route.navigate(['/memberShipType-index']);
    });
    }
  }

    cancel() {
    this.route.navigate(['/memberShipType-index']);
  }
}
