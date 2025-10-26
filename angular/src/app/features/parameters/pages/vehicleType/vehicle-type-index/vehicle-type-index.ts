/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { VehicleType } from '../vehicle-type';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-vehicle-type-index',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatPaginator
  ],
  templateUrl: './vehicle-type-index.html',
  styleUrl: './vehicle-type-index.scss'
})
export class VehicleTypeIndex implements OnInit {
  dataSource = new MatTableDataSource<VehicleType>();
  originalData: VehicleType[] = [];
  pagedData: VehicleType[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllTypeVehicle();
  }

  getAllTypeVehicle(): void {
    this._generalService.get<VehicleType[]>('TypeVehicle/select').subscribe({
      next: (items) => {
        this.originalData = items || [];
        this.dataSource.data = items || [];
        this.applyPagination();
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de vehículo.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
        this.pagedData = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/TypeVehicle-form']);
  }

  goToEdit(item: VehicleType): void {
    this.router.navigate(['/TypeVehicle-form', item.id]);
  }

  deleteTypeVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de vehículo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('TypeVehicle', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El vehículo ha sido eliminado.', 'success');
            this.getAllTypeVehicle();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentTypeVehicle(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de vehículo permanentemente.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('TypeVehicle/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de vehículo ha sido eliminado permanentemente.', 'success');
            this.getAllTypeVehicle();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(v =>
        v.name?.toLowerCase().includes(filterValue) ||
        (v.asset ? 'activo' : 'inactivo').includes(filterValue)
      );
    }

    this.dataSource.data = filteredData;
    this.applyPagination();
  }

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

  getVehicleIcon(name: string): string {
    const normalizedName = (name || '').toLowerCase();
    if (normalizedName.includes('moto') || normalizedName.includes('bici')) return 'two_wheeler';
    if (normalizedName.includes('camion') || normalizedName.includes('truck')) return 'local_shipping';
    if (normalizedName.includes('bus') || normalizedName.includes('autobus')) return 'directions_bus';
    if (normalizedName.includes('taxi')) return 'local_taxi';
    return 'directions_car';
  }

  getVehicleIconClass(name: string): string {
    const normalizedName = (name || '').toLowerCase();
    if (normalizedName.includes('moto') || normalizedName.includes('bici')) return 'icon-motorcycle';
    if (normalizedName.includes('camion') || normalizedName.includes('truck')) return 'icon-truck';
    if (normalizedName.includes('bus') || normalizedName.includes('autobus')) return 'icon-bus';
    if (normalizedName.includes('taxi')) return 'icon-taxi';
    return 'icon-car';
  }
}
