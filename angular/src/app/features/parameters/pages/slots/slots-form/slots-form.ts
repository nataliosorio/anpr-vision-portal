/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { Sectors } from '../../sectors/sectors';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-slots-form',
  imports: [GenericForm],
  templateUrl: './slots-form.html',
  styleUrl: './slots-form.scss'
})
export class SlotsForm implements OnInit {
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
        // { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-Z0-9 ]+$', message: 'El nombre solo puede contener letras y números.' }
      ]
    },
    {
      name: 'sectorsId',
      label: 'Sector al que pertenece',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un sector.' }
      ]
    },
    {
      name: 'asset',
      label: 'Activo',
      type: 'toggle',
      value: true,
      hidden: true // oculto por defecto
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

    // Cargar sectores dinámicamente
    this.service.get<Sectors[]>('Sectors/select')
      .subscribe({
        next: (data) => {
          if (data) {
            this.formConfig = this.formConfig.map(field => {
              if (field.name === 'sectorsId') {
                return {
                  ...field,
                  options: data.map(item => ({
                    value: item.id,
                    label: item.name
                  }))
                };
              }
              return field;
            });
          }
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Error al cargar sectores', text: err.message });
        }
      });

    // Si es edición, cargar datos iniciales
    if (id) {
      this.isEdit = true;
      this.service.getById<any>('Slots', id)
        .subscribe({
          next: (data) => { this.initialData = data; },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Error al cargar slot', text: err.message });
          }
        });
    }
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('Slots', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/slots-index']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo actualizar',
            text: err.message ?? 'Error desconocido'
          });
        }
      });
    } else {
      delete data.id;
      this.service.post('Slots', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/slots-index']);
        },
        error: (err) => {
          console.error('ERROR creando slot:', err); // <- confirma aquí en consola
          Swal.fire({
            icon: 'error',
            title: 'No se pudo crear el Slot',
            text: err.message ?? 'Error desconocido'
          });
        }
      });
    }
  }

  cancel() {
    this.route.navigate(['/slots-index']);
  }
}
