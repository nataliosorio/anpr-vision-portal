import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Parking } from '../parking';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-parking-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule,MatPaginator],
  templateUrl: './parking-index.html',
  styleUrl: './parking-index.scss'
})
export class ParkingIndex implements OnInit {
dataSource = new MatTableDataSource<Parking>();
 originalData: Parking[] = [];
 selectedFilter: string = 'all';
columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'location', label: 'Ubicación' },
  { key: 'parkingCategory', label: 'Categoría del Parqueadero' },
  { key: 'asset', label: 'Estado' },
  { key: 'isDeleted', label: 'Eliminado Lógicamente' }
];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  constructor() {}
 ngOnInit(): void {
    this.getAllParkings();
  }

 getAllParkings(): void {
  this._generalService.get<{ data: Parking[] }>('Parking/join').subscribe(response => {
    this.dataSource.data = response.data;
     this.originalData = response.data;
    this.dataSource.paginator = this.paginator;
  });
}

goToCreate(): void {
  this.router.navigate(['/parking-form']);
}

goToEdit(form: Parking): void {
  this.router.navigate(['/parking-form', form.id]);
}


deleteParking(id: number): void {
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
      this._generalService.delete('Parking', id).subscribe(() => {
        Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
        this.getAllParkings();
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
      this._generalService.delete('Parking/permanent', id).subscribe(() => {
        Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
        this.getAllParkings();
      });
    }
  });
}

// Funciones para las estadísticas del header
  getTotalParkings(): number {
    return this.originalData.length;
  }

  getActiveParkings(): number {
    return this.originalData.filter(parking => parking.asset && !parking.isDeleted).length;
  }

  getDeletedParkings(): number {
    return this.originalData.filter(parking => parking.isDeleted).length;
  }

   // Función para aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    // Aplicar filtro de búsqueda
    if (filterValue) {
      filteredData = filteredData.filter(parking =>
        parking.name?.toLowerCase().includes(filterValue) ||
        parking.location?.toLowerCase().includes(filterValue) ||
        parking.parkingCategory?.toLowerCase().includes(filterValue)
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
      filteredData = filteredData.filter(parking =>
        parking.name?.toLowerCase().includes(searchValue) ||
        parking.location?.toLowerCase().includes(searchValue) ||
        parking.parkingCategory?.toLowerCase().includes(searchValue)
      );
    }

    // Aplicar filtro de estado
    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
  }

  // Función auxiliar para aplicar filtro de estado
  private applyStatusFilter(data: Parking[]): Parking[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(parking => parking.asset && !parking.isDeleted);
      case 'inactive':
        return data.filter(parking => !parking.asset && !parking.isDeleted);
      case 'deleted':
        return data.filter(parking => parking.isDeleted);
      case 'all':
      default:
        return data;
    }
  }
}
