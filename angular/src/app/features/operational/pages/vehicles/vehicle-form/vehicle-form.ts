/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ClientTempForm } from '../client-temp-form/client-temp-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, forkJoin, map, startWith } from 'rxjs';
import { General } from 'src/app/core/services/general.service';
import { VehicleType } from 'src/app/features/parameters/pages/vehicleType/vehicle-type';
import { Client } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-vehicle-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.scss'
})
export class VehicleForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  tempClient: any = null;

  // data
  typeVehicles: any[] = [];
  clients: any[] = [];

  // autocompletes
  filteredClients!: Observable<any[]>;
  filteredTypeVehicles!: Observable<any[]>;

  private service = inject(General);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  // ngOnInit(): void {
  //   const id = this.activatedRoute.snapshot.paramMap.get('id');
  //   this.isEdit = !!id;

  //   // construir formulario
  //   this.form = this.fb.group({
  //     id: [null],
  //     plate: ['', Validators.required,Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{3}\d{2}[A-Z]$/)],
  //     color: ['', Validators.required],
  //     typeVehicleId: [null, Validators.required],
  //     clientId: [null, Validators.required],
  //     asset: [true]
  //   });

  //   // cargar tipos de vehículo
  //   this.service.get<VehicleType[]>('TypeVehicle/select').subscribe({
  //     next: (items) => {
  //       this.typeVehicles = (items || []).map(it => ({ value: it.id, label: it.name }));

  //       this.filteredTypeVehicles = this.form.get('typeVehicleId')!.valueChanges.pipe(
  //         startWith(''),
  //         map(value => (typeof value === 'string' ? value : value?.label || '')),
  //         map(name => (name ? this._filterTypeVehicles(name) : this.typeVehicles.slice()))
  //       );
  //     },
  //     error: (err: Error) => {
  //       Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de vehículo.', 'error');
  //     }
  //   });

  //   // cargar clientes
  //   this.service.get<Client[]>('Client/join').subscribe({
  //     next: (items) => {
  //       this.clients = (items || []).map(it => ({ value: it.id, label: it.name }));

  //       this.filteredClients = this.form.get('clientId')!.valueChanges.pipe(
  //         startWith(''),
  //         map(value => (typeof value === 'string' ? value : value?.label || '')),
  //         map(name => (name ? this._filterClients(name) : this.clients.slice()))
  //       );
  //     },
  //     error: (err: Error) => {
  //       Swal.fire('Error', err.message || 'No se pudieron cargar los clientes.', 'error');
  //     }
  //   });

  //   // si es edición
  //   if (this.isEdit && id) {
  //     this.service.getById<any>('Vehicle', id).subscribe({
  //       next: (item) => {
  //         this.form.patchValue(item);

  //         if (item.typeVehicleId) {
  //           const type = this.typeVehicles.find(t => t.value === item.typeVehicleId);
  //           if (type) {
  //             this.form.get('typeVehicleId')?.setValue(type);
  //           }
  //         }

  //         if (item.clientId) {
  //           const client = this.clients.find(c => c.value === item.clientId);
  //           if (client) {
  //             this.form.get('clientId')?.setValue(client);
  //           }
  //         }
  //       },
  //       error: (err: Error) => {
  //         Swal.fire('Error', err.message || 'No se pudo cargar el vehículo.', 'error');
  //       }
  //     });
  //   }
  // }

  // mostrar nombres en inputs
ngOnInit(): void {
  const id = this.activatedRoute.snapshot.paramMap.get('id');
  this.isEdit = !!id;

  // construir formulario con validaciones de placa corregidas
  this.form = this.fb.group({
    id: [null],
    plate: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Z]{3}\d{3}$|^[A-Z]{3}\d{2}[A-Z]$/)
      ]
    ],
    color: ['', Validators.required],
    typeVehicleId: [null, Validators.required],
    clientId: [null, Validators.required],
    asset: [true]
  });

  // Cargar tipos de vehículo y clientes en paralelo
  const typeVehicles$ = this.service.get<VehicleType[]>('TypeVehicle/select');
  const clients$ = this.service.get<Client[]>('Client/join');

  forkJoin([typeVehicles$, clients$]).subscribe({
    next: ([typeVehicles, clients]) => {
      // Procesar tipos de vehículo
      this.typeVehicles = (typeVehicles || []).map(it => ({ value: it.id, label: it.name }));
      this.filteredTypeVehicles = this.form.get('typeVehicleId')!.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value?.label || '')),
        map(name => (name ? this._filterTypeVehicles(name) : this.typeVehicles.slice()))
      );

      // Procesar clientes
      this.clients = (clients || []).map(it => ({ value: it.id, label: it.name }));
      this.filteredClients = this.form.get('clientId')!.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value?.label || '')),
        map(name => (name ? this._filterClients(name) : this.clients.slice()))
      );

      // Si es edición, cargar el vehículo después de tener los arrays listos
      if (this.isEdit && id) {
        this.service.getById<any>('Vehicle', id).subscribe({
          next: (item) => {
            this.form.patchValue(item);

            const type = this.typeVehicles.find(t => t.value === item.typeVehicleId);
            if (type) this.form.get('typeVehicleId')?.setValue(type);

            const client = this.clients.find(c => c.value === item.clientId);
            if (client) this.form.get('clientId')?.setValue(client);
          },
          error: (err: Error) => {
            Swal.fire('Error', err.message || 'No se pudo cargar el vehículo.', 'error');
          }
        });
      }
    },
    error: (err: Error) => {
      Swal.fire('Error', err.message || 'No se pudieron cargar los datos iniciales.', 'error');
    }
  });
}

  displayClient = (client: any): string => client && client.label ? client.label : '';
  displayTypeVehicle = (type: any): string => type && type.label ? type.label : '';

  // filtros
  private _filterClients(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter(c => c.label.toLowerCase().includes(filterValue));
  }

  private _filterTypeVehicles(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.typeVehicles.filter(t => t.label.toLowerCase().includes(filterValue));
  }

  openClientTempModal() {
  const dialogRef = this.dialog.open(ClientTempForm, { width: '500px' });

  dialogRef.afterClosed().subscribe((createdClient) => {
    if (createdClient) {
      const newClient = { value: createdClient.id, label: createdClient.name };
      this.clients.push(newClient);
      this.form.get('clientId')?.setValue(newClient);
    }
  });
}


  // save() {
  //   const data = { ...this.form.value };

  //   // extraer ids de autocomplete
  //   if (data.clientId && data.clientId.value) {
  //     data.clientId = data.clientId.value;
  //   }
  //   if (data.typeVehicleId && data.typeVehicleId.value) {
  //     data.typeVehicleId = data.typeVehicleId.value;
  //   }

  //   // si hay cliente temporal
  //   if (String(data.clientId).startsWith('temp-') && this.tempClient) {
  //     this.service.post<Client>('Client', this.tempClient).subscribe({
  //       next: (createdClient) => {
  //         data.clientId = createdClient.id;
  //         this.saveVehicle(data);
  //       },
  //       error: (err: Error) => {
  //         Swal.fire('Error', err.message || 'No se pudo crear el cliente.', 'error');
  //       }
  //     });
  //   } else {
  //     this.saveVehicle(data);
  //   }
  // }

  save() {
  const data = { ...this.form.value };

  // Normalizar TypeVehicleId
  if (data.typeVehicleId && typeof data.typeVehicleId === 'object' && data.typeVehicleId.value) {
    data.typeVehicleId = Number(data.typeVehicleId.value);
  } else if (typeof data.typeVehicleId === 'string') {
    const type = this.typeVehicles.find(t => t.label.toLowerCase() === data.typeVehicleId.toLowerCase());
    data.typeVehicleId = type ? Number(type.value) : 0;
  } else {
    data.typeVehicleId = Number(data.typeVehicleId);
  }

  // Normalizar ClientId
  if (data.clientId && typeof data.clientId === 'object' && data.clientId.value) {
    data.clientId = Number(data.clientId.value);
  } else if (typeof data.clientId === 'string') {
    const client = this.clients.find(c => c.label.toLowerCase() === data.clientId.toLowerCase());
    data.clientId = client ? Number(client.value) : 0;
  } else {
    data.clientId = Number(data.clientId);
  }

  this.saveVehicle(data);
}


  private saveVehicle(data: any) {
    if (!this.isEdit) {
      delete data.id;
      this.service.post('Vehicle', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Vehículo creado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/vehicles-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el vehículo.', 'error');
        }
      });
    } else {
      this.service.put('Vehicle', data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Vehículo actualizado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/vehicles-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el vehículo.', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/vehicles-index']);
  }
}
