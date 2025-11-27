/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-module-form',
  imports: [GenericForm],
  templateUrl: './module-form.html',
  styleUrl: './module-form.scss'
})
export class ModuleForm implements OnInit {
  formConfig!: FieldConfig[];

  isEdit = false;
  initialData: any = {};

  private service = inject(General);
  private loaderService = inject(LoaderService);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    this.formConfig = [
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
        name: 'description',
        label: 'Descripción',
        type: 'text',
        required: true,
        validations: [
          { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'La descripción es obligatoria.' },
          { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 5, message: 'La descripción debe tener al menos 5 caracteres.' },
          { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 200, message: 'La descripción no puede exceder los 200 caracteres.' },
          { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
        ]
      },
      {
        name: 'asset',
        label: 'Activo',
        type: 'toggle',
        value: true,
        hidden: !this.isEdit
      }
    ];

    if (this.isEdit) {
      this.loaderService.show();
      this.service.getById<any>('Module', id!)
        .subscribe({
          next: (response) => {
            this.initialData = response;
          },
          error: (err: Error) => {
            Swal.fire('Error', err.message || 'No se pudo cargar el módulo.', 'error');
            this.route.navigate(['/module-index']);
            this.loaderService.hide();
          },
          complete: () => this.loaderService.hide()
        });
    }
  }

  save(data: any) {
    this.loaderService.show();
    if (this.isEdit) {
      this.service.put('Module', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/module-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
          this.loaderService.hide();
        },
        complete: () => this.loaderService.hide()
      });
    } else {
      const payload = { ...data, asset: true };
      delete payload.id;
      this.service.post('Module', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/module-index']);
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
    this.route.navigate(['/module-index']);
  }
}
