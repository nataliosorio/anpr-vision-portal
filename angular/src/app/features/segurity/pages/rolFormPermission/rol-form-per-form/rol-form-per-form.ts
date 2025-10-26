/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Role, Permission } from 'src/app/shared/Models/Entitys';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rol-form-per-form',
  imports: [GenericForm],
  templateUrl: './rol-form-per-form.html',
  styleUrl: './rol-form-per-form.scss'
})
export class RolFormPerForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'rolId',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un rol.' }
      ]
    },
    {
      name: 'permissionId',
      label: 'Permiso',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar un permiso.' }
      ]
    },
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

    // Cargar opciones
    this.loadSelectOptions<Role>('Rol/select', 'rolId');
    this.loadSelectOptions<Permission>('Permission/select', 'permissionId');
    // this.loadSelectOptions<AppForm>('Form/select', 'formId');

    // Modo edición
    if (id) {
      this.isEdit = true;
      this.service.getById<any>('RolFormPermission', id).subscribe({
        next: (data) => {
          this.initialData = this.normalize(data);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el registro.', 'error');
          this.route.navigate(['/rolFormPermission-index']);
        }
      });
    }
  }

  /** Carga genérica de opciones para selects */
  private loadSelectOptions<T extends { id: number; name: string }>(
    endpoint: string,
    fieldName: 'rolId' | 'permissionId' | 'formId'
  ) {
    this.service.get<T[]>(endpoint).subscribe({
      next: (items) => {
        const options = (items || []).map(item => ({ value: item.id, label: item.name }));
        this.formConfig = this.formConfig.map(field =>
          field.name === fieldName ? { ...field, options } : field
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || `No se pudieron cargar las opciones de ${fieldName}.`, 'error');
      }
    });
  }

  private normalize(d: any) {
    return {
      id: d.id,
      rolId: d.rolId ?? d.rol?.id ?? null,
      permissionId: d.permissionId ?? d.permission?.id ?? null,
      formId: d.formId ?? d.form?.id ?? null,
      asset: d.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('RolFormPermission', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/rolFormPermission-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('RolFormPermission', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/rolFormPermission-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.route.navigate(['/rolFormPermission-index']);
  }
}
