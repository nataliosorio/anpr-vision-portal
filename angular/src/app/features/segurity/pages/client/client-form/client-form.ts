/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { Person } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-form',
  imports: [GenericForm],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre del cliente',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre del cliente es obligatorio.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 2, message: 'El nombre debe tener al menos 2 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 50, message: 'El nombre no puede exceder los 50 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
      ]
    },
    {
      name: 'personId',
      label: 'Persona Asociada',
      type: 'select',
      required: true,
      options: [],
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'Debe seleccionar una persona.' }
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

    // Cargar personas para el select
    this.service.get<Person[]>('Person/select').subscribe({
      next: (people) => {
        const opts = (people || []).map(p => ({
          value: p.id,
          label: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
        }));
        this.formConfig = this.formConfig.map(f =>
          f.name === 'personId' ? { ...f, options: opts } : f
        );
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las personas.', 'error');
      }
    });

    // Si es edición, cargar cliente
    if (this.isEdit && id) {
      this.service.getById<any>('Client', id).subscribe({
        next: (client) => {
          this.initialData = this.normalizeClient(client);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el cliente.', 'error');
          this.router.navigate(['/client-index']);
        }
      });
    }
  }

  private normalizeClient(c: any) {
    return {
      id: c.id,
      name: c.name,
      personId: c.personId ?? c.person?.id ?? null,
      asset: c.asset ?? true
    };
  }

  save(data: any) {
    if (this.isEdit) {
      this.service.put('Client', data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Registro actualizado exitosamente', showConfirmButton: false, timer: 2000, timerProgressBar: true });
          this.router.navigate(['/client-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
        }
      });
    } else {
      const payload = { ...data };
      delete payload.id;

      this.service.post('Client', payload).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Registro creado exitosamente', showConfirmButton: false, timer: 2000, timerProgressBar: true });
          this.router.navigate(['/client-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el registro.', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/client-index']);
  }
}
