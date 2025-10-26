/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Module from 'module';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-module-form',
  imports: [GenericForm],
  templateUrl: './form-module-form.html',
  styleUrl: './form-module-form.scss'
})
export class FormModuleForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'formId',
      label: 'Formulario',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un formulario.' }
      ]
    },
    {
      name: 'moduleId',
      label: 'Módulo',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un módulo.' }
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

    // Cargar selects
    // this.loadSelectOptions<AppForm>('Form/select', 'formId');
    // this.loadSelectOptions<Module>('Module/select', 'moduleId');

    // Modo edición
    if (id) {
      this.isEdit = true;
      this.service.getById<any>('FormModule', id).subscribe({
        next: (data) => {
          this.initialData = this.normalize(data);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el registro.', 'error');
          this.route.navigate(['/form-module-index']);
        }
      });
    }
  }

  /** Carga genérica de opciones para selects */
  private loadSelectOptions<T extends { id: number; name: string }>(
    endpoint: string,
    fieldName: 'formId' | 'moduleId'
  ) {
    this.service.get<T[]>(endpoint).subscribe({
      next: (items) => {
        const options = (items || []).map(item => ({ value: item.id, label: item.name }));
        this.formConfig = this.formConfig.map(field =>
          field.name === fieldName ? { ...field, options } : field
        );
      },
      error: (err: Error) => {
        const label = fieldName === 'formId' ? 'formularios' : 'módulos';
        Swal.fire('Error', err.message || `No se pudieron cargar los ${label}.`, 'error');
      }
    });
  }

  /** Normaliza por si el back trae anidado (form/module) o plano (formId/moduleId) */
  private normalize(d: any) {
    return {
      id: d.id,
      formId: d.formId ?? d.form?.id ?? null,
      moduleId: d.moduleId ?? d.module?.id ?? null,
      asset: d.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('FormModule', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/form-module-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('FormModule', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/form-module-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.route.navigate(['/form-module-index']);
  }
}
