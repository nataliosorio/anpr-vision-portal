import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import Module from 'module';
import { General } from 'src/app/core/services/general.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';

@Component({
  selector: 'app-module-index',
  imports: [GenericTable],
  templateUrl: './module-index.html',
  styleUrl: './module-index.scss'
})
export class ModuleIndex implements OnInit {
  dataSource = new MatTableDataSource<Module>();
  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllModules();
  }

  getAllModules(): void {
    this._generalService.get<Module[]>('Module/select').subscribe({
      next: (items) => {
        this.dataSource.data = items || [];
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los módulos.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/module-form']);
  }

  goToEdit(module: Module): void {
    this.router.navigate(['/module-form', module.id]);
  }

  deleteModule(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el módulo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Module', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El módulo ha sido eliminado.', 'success');
            this.getAllModules();
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
      text: 'Esta acción eliminará el módulo permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Module/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El módulo ha sido eliminado permanentemente.', 'success');
            this.getAllModules();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
