import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { RegisteredVehicle } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registered-vehicle-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule],
  templateUrl: './registered-vehicle-index.html',
  styleUrl: './registered-vehicle-index.scss'
})
export class RegisteredVehicleIndex implements OnInit {
  dataSource = new MatTableDataSource<RegisteredVehicle>();
  parkingId: string | null = null;
  originalData: RegisteredVehicle[] = [];
  selectedFilter: string = 'all';

  columns = [
    { key: 'entryDate', label: 'Fecha de Entrada' },
    { key: 'exitDate', label: 'Fecha de Salida' },
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'slots', label: 'Slot' },
    { key: 'asset', label: 'Estado' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.parkingId = this._generalService.getParkingId();
    this.getAllRegisteredVehicles();
  }

  // getAllRegisteredVehicles(): void {
  //   this._generalService.get<RegisteredVehicle[]>('RegisteredVehicles/by-parking/').subscribe({
  //     next: (items) => {
  //       this.originalData = items || [];
  //       this.dataSource.data = this.originalData;
  //       if (this.paginator) this.dataSource.paginator = this.paginator;
  //     },
  //     error: (err: Error) => {
  //       Swal.fire('Error', err.message || 'No se pudieron cargar los registros de vehículos.', 'error');
  //       this.originalData = [];
  //       this.dataSource.data = [];
  //     }
  //   });
  // }

  getAllRegisteredVehicles(): void {
  const parkingId = this._generalService.getParkingId();
  if (!parkingId) {
    Swal.fire('Error', 'No se encontró el ID del parqueadero.', 'error');
    return;
  }

  this._generalService.get<RegisteredVehicle[]>('RegisteredVehicles/join').subscribe({
    next: (items) => {
      this.originalData = items || [];
      this.dataSource.data = this.originalData;
      if (this.paginator) this.dataSource.paginator = this.paginator;
    },
    error: (err: Error) => {
      Swal.fire('Error', err.message || 'No se pudieron cargar los registros de vehículos.', 'error');
      this.originalData = [];
      this.dataSource.data = [];
    }
  });
}


  goToCreate(): void {
    this.router.navigate(['/registeredVehicle-form']);
  }

  goToEdit(form: RegisteredVehicle): void {
    this.router.navigate(['/registeredVehicle-form', form.id]);
  }

  deleteRegisteredVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro de vehículo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('RegisteredVehicles', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro de vehículo ha sido eliminado.', 'success');
            this.getAllRegisteredVehicles();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentRegisteredVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro de vehículo permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('RegisteredVehicles/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro de vehículo ha sido eliminado permanentemente.', 'success');
            this.getAllRegisteredVehicles();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  // ---- Estadísticas (header)
  getTotalRegisteredVehicles(): number {
    return this.originalData.length;
  }

  getActiveRegisteredVehicles(): number {
    return this.originalData.filter(rv => rv.asset && !rv.isDeleted).length;
  }

  getDeletedRegisteredVehicles(): number {
    return this.originalData.filter(rv => rv.isDeleted).length;
  }

  // ---- Filtros
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(rv =>
        rv.vehicle?.toLowerCase().includes(filterValue) ||
        rv.slots?.toLowerCase().includes(filterValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);
    this.dataSource.data = filteredData;
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;

    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredData = this.originalData;

    if (searchValue) {
      filteredData = filteredData.filter(rv =>
        rv.vehicle?.toLowerCase().includes(searchValue) ||
        rv.slots?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);
    this.dataSource.data = filteredData;
  }

  private applyStatusFilter(data: RegisteredVehicle[]): RegisteredVehicle[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(rv => rv.asset && !rv.isDeleted);
      case 'inactive':
        return data.filter(rv => !rv.asset && !rv.isDeleted);
      case 'deleted':
        return data.filter(rv => rv.isDeleted);
      case 'all':
      default:
        return data;
    }
  }
}
