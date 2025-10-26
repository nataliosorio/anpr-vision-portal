import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { Rates } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-rates-index',
  imports: [GenericTable],
  templateUrl: './rates-index.html',
  styleUrl: './rates-index.scss'
})
export class RatesIndex implements OnInit {
  dataSource = new MatTableDataSource<Rates>();
  parkingId: string | null = null;
  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: 'Cantidad' },
    { key: 'starHour', label: 'Hora de Inicio' }, // ← si realmente es startHour en tu back, cámbialo aquí
    { key: 'endHour', label: 'Hora de Fin' },
    { key: 'year', label: 'Año' },
    { key: 'ratesType', label: 'Tipo de Tarifa' },
    { key: 'typeVehicle', label: 'Tipo de Vehículo' },
    { key: 'parking', label: 'Parqueadero' },
    { key: 'asset', label: 'Estado' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.parkingId = this._generalService.getParkingId();
    this.getAllRates();
  }

  getAllRates(): void {
    this._generalService.get<Rates[]>('Rates/join').subscribe({
      next: (items) => {
        this.dataSource.data = items || [];
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las tarifas.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/rates-form']);
  }

  goToEdit(form: Rates): void {
    this.router.navigate(['/rates-form', form.id]);
  }

  deleteModule(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Rates', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            this.getAllRates();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentModule(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Rates/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
            this.getAllRates();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
