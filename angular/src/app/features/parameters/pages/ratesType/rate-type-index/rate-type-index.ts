import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RateType } from '../rate-type';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-rate-type-index',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatPaginator
  ],
  templateUrl: './rate-type-index.html',
  styleUrl: './rate-type-index.scss'
})
export class RateTypeIndex implements OnInit {
  dataSource = new MatTableDataSource<RateType>();
  originalData: RateType[] = [];
  pagedData: RateType[] = [];
  selectedFilter: string = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllTypeRates();
  }

  getAllTypeRates(): void {
    this._generalService.get<RateType[]>('RatesType/select').subscribe({
      next: (items) => {
        this.originalData = items || [];
        this.dataSource.data = items || [];
        this.applyPagination();
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de tarifa.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
        this.pagedData = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/RatesType-form']);
  }

  goToEdit(item: RateType): void {
    this.router.navigate(['/RatesType-form', item.id]);
  }

  deleteRateType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de tarifa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('RatesType', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de tarifa ha sido eliminado.', 'success');
            this.getAllTypeRates();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentRateType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de tarifa permanentemente.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('RatesType/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de tarifa ha sido eliminado permanentemente.', 'success');
            this.getAllTypeRates();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  // --- Search + Filtro estado ---
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(rt =>
        rt.name?.toLowerCase().includes(filterValue) ||
        rt.description?.toLowerCase().includes(filterValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);
    this.dataSource.data = filteredData;
    this.applyPagination();
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;

    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredData = this.originalData;

    if (searchValue) {
      filteredData = filteredData.filter(rt =>
        rt.name?.toLowerCase().includes(searchValue) ||
        rt.description?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);
    this.dataSource.data = filteredData;
    this.applyPagination();
  }

  private applyStatusFilter(data: RateType[]): RateType[] {
    switch (this.selectedFilter) {
      case 'active':   return data.filter(rt => rt.asset && !rt.isDeleted);
      case 'inactive': return data.filter(rt => !rt.asset && !rt.isDeleted);
      case 'deleted':  return data.filter(rt => rt.isDeleted);
      case 'all':
      default:         return data;
    }
  }

  // --- Paginación ---
  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pagedData = this.dataSource.data.slice(startIndex, endIndex);
  }

  private applyPagination() {
    this.pagedData = this.dataSource.data.slice(0, 5);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
