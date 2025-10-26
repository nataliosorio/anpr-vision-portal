import { Component, inject, OnInit, ViewChild } from '@angular/core';
// import { GenericTable } from 'src/app/demo/ui-element/generic-table/generic-table';
import { ParkingCtegory } from '../parking-ctegory';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RateType } from '../../ratesType/rate-type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-parking-category-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule,CommonModule, FormsModule],
  templateUrl: './parking-category-index.html',
  styleUrl: './parking-category-index.scss'
})
export class ParkingCategoryIndex implements OnInit {
dataSource = new MatTableDataSource<ParkingCtegory>();
originalData: ParkingCtegory[] = [];
  selectedFilter: string = 'all';
columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripción' },
  { key: 'code', label: 'Código' },
  { key: 'asset', label: 'Estado' },
  { key: 'isDeleted', label: 'Eliminado Lógicamente' }
];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  constructor() {}
 ngOnInit(): void {
    this.getAllTypeRates();
  }

 getAllTypeRates(): void {
  this._generalService.get<{ data: ParkingCtegory[] }>('ParkingCategory/select').subscribe(response => {
    this.dataSource.data = response.data;
    this.originalData = response.data;
    this.dataSource.paginator = this.paginator;
  });
}

goToCreate(): void {
  this.router.navigate(['/ParkingCategory-form']);
}

goToEdit(RatesType: RateType): void {
  this.router.navigate(['/ParkingCategory-form', RatesType.id]);
}


deleteCategory(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la categoría del parqueadero.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this._generalService.delete('ParkingCategory', id).subscribe(() => {
        Swal.fire('¡Eliminado!', 'La categoría del parqueadero ha sido eliminado.', 'success');
        this.getAllTypeRates();
      });
    }
  });
}

deletePermanentCategory(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la categoría del parqueadero permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this._generalService.delete('ParkingCategory/permanent', id).subscribe(() => {
        Swal.fire('¡Eliminado!', 'La categoría del parqueadero ha sido eliminado permanentemente.', 'success');
        this.getAllTypeRates();
      });
    }
  });
}
// Funciones para las estadísticas del header
  getTotalCategories(): number {
    return this.originalData.length;
  }

  getActiveCategories(): number {
    return this.originalData.filter(category => category.asset && !category.isDeleted).length;
  }

  getDeletedCategories(): number {
    return this.originalData.filter(category => category.isDeleted).length;
  }

  // Función para aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    // Aplicar filtro de búsqueda
    if (filterValue) {
      filteredData = filteredData.filter(category =>
        category.name?.toLowerCase().includes(filterValue) ||
        category.code?.toLowerCase().includes(filterValue) ||
        category.description?.toLowerCase().includes(filterValue)
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
      filteredData = filteredData.filter(category =>
        category.name?.toLowerCase().includes(searchValue) ||
        category.code?.toLowerCase().includes(searchValue) ||
        category.description?.toLowerCase().includes(searchValue)
      );
    }

    // Aplicar filtro de estado
    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
  }

  // Función auxiliar para aplicar filtro de estado
  private applyStatusFilter(data: ParkingCtegory[]): ParkingCtegory[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(category => category.asset && !category.isDeleted);
      case 'inactive':
        return data.filter(category => !category.asset && !category.isDeleted);
      case 'deleted':
        return data.filter(category => category.isDeleted);
      case 'all':
      default:
        return data;
    }
  }
}
