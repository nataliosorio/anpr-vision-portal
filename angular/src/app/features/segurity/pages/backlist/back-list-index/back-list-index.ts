import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { BlackList } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-back-list-index',
  imports: [GenericTable],
  templateUrl: './back-list-index.html',
  styleUrl: './back-list-index.scss'
})
export class BackListIndex implements OnInit {
  dataSource = new MatTableDataSource<BlackList>();
  columns = [
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'reason', label: 'Razón' },
    { key: 'restrictionDate', label: 'Fecha de Restriccion' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllBlackList();
  }

  getAllBlackList(): void {
    this._generalService.get<BlackList[]>('BlackList/join').subscribe({
      next: (items) => {
        this.dataSource.data = items || [];
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudo cargar la lista negra.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/blackList-form']);
  }

  goToEdit(form: BlackList): void {
    this.router.navigate(['/blackList-form', form.id]);
  }

  deleteModule(id: number): void {
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
        this._generalService.delete('BlackList', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            this.getAllBlackList();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
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
        this._generalService.delete('BlackList/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
            this.getAllBlackList();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
