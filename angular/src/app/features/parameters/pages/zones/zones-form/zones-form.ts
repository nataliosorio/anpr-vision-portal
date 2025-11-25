/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-zones-form',
  imports: [GenericForm],
  templateUrl: './zones-form.html',
  styleUrl: './zones-form.scss'
})
export class ZonesForm implements OnInit {
  formConfig!: FieldConfig[];

  isEdit = false;
  initialData: any = {};

  private service = inject(General);
  private loaderService = inject(LoaderService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

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
        name: 'asset',
        label: 'Activo',
        type: 'toggle',
        value: true,
        hidden: !this.isEdit
      }
    ];

    // Si es edición, cargar datos de la zona
    if (this.isEdit && id) {
      this.loaderService.show();
      this.service.getById<any>('Zones', id).subscribe({
        next: (zone) => {
          this.initialData = this.normalizeZone(zone);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar la zona.', 'error');
          this.loaderService.hide();
        },
        complete: () => this.loaderService.hide()
      });
    }
  }

  private normalizeZone(zone: any) {
    return {
      id: zone.id,
      name: zone.name,
      parkingId: zone.parkingId ?? zone.parking?.id ?? null,
      asset: zone.asset ?? true
    };
  }

  save(data: any) {
    this.loaderService.show();
    if (this.isEdit) {
      const payload = { ...data, parkingId: data.parkingId || this.service.getParkingId() };
      this.service.put('Zones', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/Zones-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
          this.loaderService.hide();
        },
        complete: () => this.loaderService.hide()
      });
    } else {
      const payload = { ...data, parkingId: this.service.getParkingId(), asset: true };
      delete payload.id;

      this.service.post('Zones', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.router.navigate(['/Zones-index']);
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
    this.router.navigate(['/Zones-index']);
  }
}
