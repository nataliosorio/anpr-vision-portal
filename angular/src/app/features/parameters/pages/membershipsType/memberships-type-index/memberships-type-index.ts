import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MembershipsType } from '../memberships-type';
import { MatPaginator } from '@angular/material/paginator';
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
  selector: 'app-memberships-type-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule],
  templateUrl: './memberships-type-index.html',
  styleUrl: './memberships-type-index.scss'
})
export class MembershipsTypeIndex implements OnInit {
  dataSource = new MatTableDataSource<MembershipsType>();
  originalData: MembershipsType[] = [];
  selectedFilter: string = 'all';

  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'durationDaysBase', label: 'Duración(días)' },
    { key: 'priceBase', label: 'Precio' },
    { key: 'asset', label: 'Estado' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllForms();
  }

  getAllForms(): void {
    this._generalService.get<MembershipsType[]>('MemberShipType/select').subscribe({
      next: (items) => {
        this.originalData = items || [];
        this.dataSource.data = items || [];
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de membresía.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/memberShipType-form']); // respeta tu ruta actual
  }

  goToEdit(form: MembershipsType): void {
    this.router.navigate(['/memberShipType-form', form.id]);
  }

  deleteMembershipType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de membresía.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('MemberShipType', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de membresía ha sido eliminado.', 'success');
            this.getAllForms();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentMembershipType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de membresía permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('MemberShipType/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de membresía ha sido eliminado permanentemente.', 'success');
            this.getAllForms();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  // Stats
  getTotalMembershipTypes(): number {
    return this.originalData.length;
  }

  getActiveMembershipTypes(): number {
    return this.originalData.filter(m => m.asset && !m.isDeleted).length;
  }

  getDeletedMembershipTypes(): number {
    return this.originalData.filter(m => m.isDeleted).length;
  }

  // Búsqueda + estado
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    let filteredData = this.originalData;

    if (filterValue) {
      filteredData = filteredData.filter(m =>
        m.name?.toLowerCase().includes(filterValue) ||
        m.description?.toLowerCase().includes(filterValue)
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
      filteredData = filteredData.filter(m =>
        m.name?.toLowerCase().includes(searchValue) ||
        m.description?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);
    this.dataSource.data = filteredData;
  }

  private applyStatusFilter(data: MembershipsType[]): MembershipsType[] {
    switch (this.selectedFilter) {
      case 'active':   return data.filter(m => m.asset && !m.isDeleted);
      case 'inactive': return data.filter(m => !m.asset && !m.isDeleted);
      case 'deleted':  return data.filter(m => m.isDeleted);
      case 'all':
      default:         return data;
    }
  }
}
