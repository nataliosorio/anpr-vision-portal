/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Person } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-person-prueba',
  imports: [GenericForm],
  templateUrl: './person-prueba.html',
  styleUrl: './person-prueba.scss'
})
export class PersonPrueba implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 2, message: 'El nombre debe tener al menos 2 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El nombre no puede exceder los 50 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
      ]
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El apellido es obligatorio.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 2, message: 'El apellido debe tener al menos 2 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El apellido no puede exceder los 50 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El apellido solo puede contener letras y espacios.' }
      ]
    },
    {
      name: 'phoneNumber',
      label: 'Teléfono',
      type: 'tel',
      validations: [
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[0-9]{7,15}$', message: 'El teléfono debe tener entre 7 y 15 dígitos.' }
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

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit && id) {
      this.service.getById<Person>('Person', id).subscribe({
        next: (person) => {
          this.initialData = this.normalizePerson(person);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar la persona.', 'error');
          this.router.navigate(['/persons-index']);
        }
      });
    }
  }

  private normalizePerson(p: any) {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phoneNumber: p.phoneNumber ?? '',
      asset: p.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('Person', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/persons-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('Person', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/persons-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/persons-index']);
  }
}
