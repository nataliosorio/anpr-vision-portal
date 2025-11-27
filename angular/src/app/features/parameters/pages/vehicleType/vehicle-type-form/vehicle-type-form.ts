/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { VehicleType } from '../vehicle-type';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FieldConfig, ValidatorNames } from 'src/app/shared/components/ui-element/generic-form/field-config.model';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';

@Component({
  selector: 'app-vehicle-type-form',
  imports: [GenericForm],
  templateUrl: './vehicle-type-form.html',
  styleUrl: './vehicle-type-form.scss'
})
export class VehicleTypeForm implements OnInit {
  formConfig: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      validations: [
        { name: ValidatorNames.Required, validator: ValidatorNames.Required, message: 'El nombre es obligatorio.' },
        { name: ValidatorNames.MinLength, validator: ValidatorNames.MinLength, value: 3, message: 'El nombre debe tener al menos 3 caracteres.' },
        { name: ValidatorNames.MaxLength, validator: ValidatorNames.MaxLength, value: 15, message: 'El nombre no puede exceder los 15 caracteres.' },
        { name: ValidatorNames.Pattern, validator: ValidatorNames.Pattern, value: '^[a-zA-ZÀ-ÿ\\s]+$', message: 'El nombre solo puede contener letras y espacios.' }
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
  private loaderService = inject(LoaderService);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loaderService.show();
     this.service.getById<VehicleType>('TypeVehicle', id)
       .subscribe({
         next: (vehicle) => {
           this.initialData = vehicle;
         },
         error: (err: Error) => {
           Swal.fire('Error', err.message || 'No se pudo cargar el tipo de vehículo.', 'error');
           this.route.navigate(['/TypeVehicle-index']);
           this.loaderService.hide();
         },
         complete: () => this.loaderService.hide()
       });

    }
  }

  save(data: any) {
    this.loaderService.show();
    if (this.isEdit) {
      this.service.put('TypeVehicle', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro actualizado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/TypeVehicle-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el registro.', 'error');
          this.loaderService.hide();
        },
        complete: () => this.loaderService.hide()
      });
    } else {
      delete data.id;
      this.service.post('TypeVehicle', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registro creado exitosamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.route.navigate(['/TypeVehicle-index']);
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
    this.route.navigate(['/TypeVehicle-index']);
  }
}
