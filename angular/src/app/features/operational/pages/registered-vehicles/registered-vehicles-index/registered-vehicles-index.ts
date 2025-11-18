import { CommonModule, DatePipe } from '@angular/common';
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
import { RegisteredVehicle } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registered-vehicles-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule, MatPaginator, DatePipe],
  templateUrl: './registered-vehicles-index.html',
  styleUrl: './registered-vehicles-index.scss'
})
export class RegisteredVehiclesIndex implements OnInit {
  dataSource = new MatTableDataSource<RegisteredVehicle>();
  originalData: RegisteredVehicle[] = [];
  selectedFilter: string = 'all';
  pagedData: RegisteredVehicle[] = [];

  columns = [
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'entryDate', label: 'Fecha de Entrada' },
    { key: 'exitDate', label: 'Fecha de Salida' },
    { key: 'slots', label: 'Slot' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllEntries();
  }

  getAllEntries(): void {
    this._generalService.get<RegisteredVehicle[]>('RegisteredVehicles/join').subscribe({
      next: (items) => {
        this.originalData = items || [];
        this.dataSource.data = items || [];
        this.applyPagination(); // ✅ inicializar con la primera página
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las entradas.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
        this.pagedData = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/registered-vehicles-form']);
  }

  goToEdit(entry: RegisteredVehicle): void {
    this.router.navigate(['/registered-vehicles-form', entry.id]);
  }

  deleteEntry(id: number): void {
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
        this._generalService.delete('RegisteredVehicle', id).subscribe({
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
            this.getAllEntries();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentEntry(id: number): void {
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
        this._generalService.delete('RegisteredVehicle/permanent', id).subscribe({
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
            this.getAllEntries();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  // Estadísticas del header
  getTotalEntries(): number {
    return this.originalData.length;
  }

  getActiveEntries(): number {
    return this.originalData.filter(e => !e.exitDate && !e.isDeleted).length;
  }

  getExitedEntries(): number {
    return this.originalData.filter(e => e.exitDate && !e.isDeleted).length;
  }

  // Búsqueda + filtros
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(e =>
        e.vehicle?.toLowerCase().includes(filterValue) ||
        e.entryDate?.toLowerCase().includes(filterValue) ||
        e.slots?.toLowerCase().includes(filterValue)
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
      filteredData = filteredData.filter(e =>
        e.vehicle?.toLowerCase().includes(searchValue) ||
        e.entryDate?.toLowerCase().includes(searchValue) ||
        e.slots?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
    this.applyPagination(); // ✅ aplicar paginación después del filtro
  }

  private applyStatusFilter(data: RegisteredVehicle[]): RegisteredVehicle[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(e => !e.exitDate && !e.isDeleted);
      case 'exited':
        return data.filter(e => e.exitDate && !e.isDeleted);
      case 'deleted':
        return data.filter(e => e.isDeleted);
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
