import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Sectors } from '../sectors';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-sectors-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule],
  templateUrl: './sectors-index.html',
  styleUrl: './sectors-index.scss'
})
export class SectorsIndex implements OnInit {
dataSource = new MatTableDataSource<Sectors>();
 originalData: Sectors[] = [];
 selectedFilter: string = 'all';
columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'capacity', label: 'Capacidad' },
  { key: 'zones', label: 'Zona' },
  { key: 'typeVehicle', label: 'Tipo de Vehículo' },
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
  this._generalService.get<Sectors[]>('Sectors/join').subscribe({
    next: (sectors) => {
      this.dataSource.data = sectors;       // <<— ya viene T directo
      this.originalData = sectors;
      this.dataSource.paginator = this.paginator;
    },
    error: (e) => {
      Swal.fire('Error', e.message || 'No se pudo cargar sectores', 'error');
    }
  });
}


goToCreate(): void {
  this.router.navigate(['/sectors-form']);
}

goToEdit(form: Sectors): void {
  this.router.navigate(['/sectors-form', form.id]);
}


deleteSector(id: number): void {
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
      this._generalService.delete('Sectors', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
          this.getAllParkings();
        },
        error: (err: Error) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: err.message
          });
        }
      });
    }
  });
}

deletePermanentSector(id: number): void {
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
      this._generalService.delete('Sectors/permanent', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
          this.getAllParkings();
        },
        error: (err: Error) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar permanentemente',
            text: err.message
          });
        }
      });
    }
  });
}

// Funciones para las estadísticas del header
  getTotalSectors(): number {
    return this.originalData.length;
  }

  getActiveSectors(): number {
    return this.originalData.filter(sector => sector.asset && !sector.isDeleted).length;
  }

  getTotalCapacity(): number {
    return this.originalData
      .filter(sector => !sector.isDeleted)
      .reduce((total, sector) => total + (sector.capacity || 0), 0);
  }

  getDeletedSectors(): number {
    return this.originalData.filter(sector => sector.isDeleted).length;
  }

  // Función para obtener el ícono según el tipo de vehículo
  getVehicleIcon(vehicleType: string): string {
    const type = vehicleType?.toLowerCase() || '';

    if (type.includes('carro') || type.includes('auto') || type.includes('vehiculo')) {
      return 'directions_car';
    } else if (type.includes('moto') || type.includes('motocicleta')) {
      return 'motorcycle';
    } else if (type.includes('camion') || type.includes('truck') || type.includes('pesado')) {
      return 'local_shipping';
    } else if (type.includes('bici') || type.includes('bicicleta')) {
      return 'pedal_bike';
    } else if (type.includes('bus') || type.includes('autobus')) {
      return 'directions_bus';
    } else {
      return 'directions_car'; // default
    }
  }

   // Función para aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    // Aplicar filtro de búsqueda
    if (filterValue) {
      filteredData = filteredData.filter(sector =>
        sector.name?.toLowerCase().includes(filterValue) ||
        sector.zones?.toLowerCase().includes(filterValue) ||
        sector.typeVehicle?.toLowerCase().includes(filterValue) ||
        sector.capacity?.toString().includes(filterValue)
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
      filteredData = filteredData.filter(sector =>
        sector.name?.toLowerCase().includes(searchValue) ||
        sector.zones?.toLowerCase().includes(searchValue) ||
        sector.typeVehicle?.toLowerCase().includes(searchValue) ||
        sector.capacity?.toString().includes(searchValue)
      );
    }

    // Aplicar filtro de estado
    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
  }

  // Función auxiliar para aplicar filtro de estado
  // Función auxiliar para aplicar filtro de estado
  private applyStatusFilter(data: Sectors[]): Sectors[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(sector => sector.asset && !sector.isDeleted);
      case 'inactive':
        return data.filter(sector => !sector.asset && !sector.isDeleted);
      case 'deleted':
        return data.filter(sector => sector.isDeleted);
      case 'all':
      default:
        return data;
    }
  }
}
