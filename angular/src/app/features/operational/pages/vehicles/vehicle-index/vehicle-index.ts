import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { Vehicle } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehicle-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule, MatPaginator],
  templateUrl: './vehicle-index.html',
  styleUrl: './vehicle-index.scss'
})
export class VehicleIndex implements OnInit {
  dataSource = new MatTableDataSource<Vehicle>();
  originalData: Vehicle[] = [];
  selectedFilter: string = 'all';
  pagedData: Vehicle[] = [];

  columns = [
    { key: 'plate', label: 'Placa' },
    { key: 'client', label: 'Cliente' },
    { key: 'typeVehicle', label: 'Tipo de Vehículo' },
    { key: 'color', label: 'Color' },
    { key: 'asset', label: 'Estado' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllVehicles();
  }

  getAllVehicles(): void {
    this._generalService.get<Vehicle[]>('Vehicle/join').subscribe({
      next: (items) => {
        this.originalData = items || [];
        this.dataSource.data = items || [];
        this.applyPagination(); // ✅ inicializar con la primera página
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los vehículos.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
        this.pagedData = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/vehicles-form']);
  }

  goToEdit(form: Vehicle): void {
    this.router.navigate(['/vehicles-form', form.id]);
  }

  deleteVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro lógicamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      background: '#fff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Vehicle', id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El registro ha sido eliminado lógicamente.',
              icon: 'success',
              confirmButtonColor: '#4caf50',
              customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-success-btn'
              }
            });
            this.getAllVehicles();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro permanentemente. Esta acción NO se puede deshacer.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#3085d6',
      background: '#fff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-danger-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Vehicle/permanent', id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado permanentemente!',
              text: 'El registro ha sido eliminado permanentemente.',
              icon: 'success',
              confirmButtonColor: '#4caf50',
              customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-success-btn'
              }
            });
            this.getAllVehicles();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  // Estadísticas del header
  getTotalVehicles(): number {
    return this.originalData.length;
  }

  getActiveVehicles(): number {
    return this.originalData.filter(v => v.asset && !v.isDeleted).length;
  }

  getDeletedVehicles(): number {
    return this.originalData.filter(v => v.isDeleted).length;
  }

  // Búsqueda + filtros
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(v =>
        v.plate?.toLowerCase().includes(filterValue) ||
        v.client?.toLowerCase().includes(filterValue) ||
        v.typeVehicle?.toLowerCase().includes(filterValue) ||
        v.color?.toLowerCase().includes(filterValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
    this.applyPagination(); // ✅ aplicar paginación después del filtro
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;

    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredData = this.originalData;

    if (searchValue) {
      filteredData = filteredData.filter(v =>
        v.plate?.toLowerCase().includes(searchValue) ||
        v.client?.toLowerCase().includes(searchValue) ||
        v.typeVehicle?.toLowerCase().includes(searchValue) ||
        v.color?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
    this.applyPagination(); // ✅ aplicar paginación después del filtro
  }

  private applyStatusFilter(data: Vehicle[]): Vehicle[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(v => v.asset && !v.isDeleted);
      case 'inactive':
        return data.filter(v => !v.asset && !v.isDeleted);
      case 'deleted':
        return data.filter(v => v.isDeleted);
      case 'all':
      default:
        return data;
    }
  }

  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pagedData = this.dataSource.data.slice(startIndex, endIndex);
  }

  private applyPagination() {
    // siempre resetear a la primera página con tamaño 5
    this.pagedData = this.dataSource.data.slice(0, 5);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
