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
import Swal from 'sweetalert2';
import { Slots } from '../slots';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-slots-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule],
  templateUrl: './slots-index.html',
  styleUrl: './slots-index.scss'
})
export class SlotsIndex implements OnInit {
dataSource = new MatTableDataSource<Slots>();
 originalData: Slots[] = [];
 selectedFilter: string = 'all';
columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'sectors', label: 'Sector' },
  { key: 'isAvailable', label: 'Disponibilidad' },
  { key: 'asset', label: 'Estado' },
  { key: 'isDeleted', label: 'Eliminado Lógicamente' }
];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  constructor() {}
 ngOnInit(): void {
    this.getAllSlots();
  }

getAllSlots(): void {
  this._generalService.get<Slots[]>('Slots/join').subscribe({
    next: (data) => {
      this.dataSource.data = data ?? [];
      this.originalData = data ?? [];
      this.dataSource.paginator = this.paginator;
    },
    error: (err: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar Slots',
        text: err.message ?? 'No fue posible obtener la lista de slots.'
      });
      this.dataSource.data = [];
      this.originalData = [];
    }
  });
}

goToCreate(): void {
  this.router.navigate(['/slots-form']);
}

goToEdit(form: Slots): void {
  this.router.navigate(['/slots-form', form.id]);
}


deleteSlot(id: number): void {
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
      this._generalService.delete('Slots', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
          this.getAllSlots();
        },
        error: (err: Error) => {
          Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
        }
      });
    }
  });
}

deletePermanentSlot(id: number): void {
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
      this._generalService.delete('Slots/permanent', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
          this.getAllSlots();
        },
        error: (err: Error) => {
          Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
        }
      });
    }
  });
}

// Funciones para las estadísticas del header
  getTotalSlots(): number {
    return this.originalData.length;
  }

  getActiveSlots(): number {
    return this.originalData.filter(slot => slot.asset && !slot.isDeleted).length;
  }

  getAvailableSlots(): number {
    return this.originalData.filter(slot => slot.isAvailable && slot.asset && !slot.isDeleted).length;
  }

  getOccupiedSlots(): number {
    return this.originalData.filter(slot => !slot.isAvailable && slot.asset && !slot.isDeleted).length;
  }

  getDeletedSlots(): number {
    return this.originalData.filter(slot => slot.isDeleted).length;
  }

  // Función para obtener el ícono según el estado del slot
  getSlotIcon(slot: Slots): string {
    if (slot.isDeleted) {
      return 'block';
    } else if (!slot.asset) {
      return 'pause_circle_outline';
    } else if (slot.isAvailable) {
      return 'radio_button_unchecked';
    } else {
      return 'radio_button_checked';
    }
  }

   // Función para aplicar filtro de búsqueda
  // Función para aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    // Aplicar filtro de búsqueda
    if (filterValue) {
      filteredData = filteredData.filter(slot =>
        slot.name?.toLowerCase().includes(filterValue) ||
        slot.sectors?.toLowerCase().includes(filterValue) ||
        slot.id?.toString().includes(filterValue)
      );
    }

    // Aplicar filtro de estado si hay uno activo
    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
  }
  // Función para filtrar por estado
  filterByStatus(status: string): void {
    this.selectedFilter = status;

    // Obtener el valor actual del input de búsqueda
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredData = this.originalData;

    // Aplicar filtro de búsqueda primero si existe
    if (searchValue) {
      filteredData = filteredData.filter(slot =>
        slot.name?.toLowerCase().includes(searchValue) ||
        slot.sectors?.toLowerCase().includes(searchValue) ||
        slot.id?.toString().includes(searchValue)
      );
    }

    // Aplicar filtro de estado
    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
  }
// Función auxiliar para aplicar filtro de estado
  private applyStatusFilter(data: Slots[]): Slots[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(slot => slot.asset && !slot.isDeleted);
      case 'inactive':
        return data.filter(slot => !slot.asset && !slot.isDeleted);
      case 'available':
        return data.filter(slot => slot.isAvailable && slot.asset && !slot.isDeleted);
      case 'occupied':
        return data.filter(slot => !slot.isAvailable && slot.asset && !slot.isDeleted);
      case 'deleted':
        return data.filter(slot => slot.isDeleted);
      case 'all':
      default:
        return data;
    }
  }
}
