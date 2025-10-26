/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { FormModule } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-form-module-index',
  imports: [GenericTable],
  templateUrl: './form-module-index.html',
  styleUrl: './form-module-index.scss'
})
export class FormModuleIndex implements OnInit {
  dataSource = new MatTableDataSource<FormModule>();
  columns = [
    { key: 'moduleName', label: 'Nombre del Módulo' },
    { key: 'formName', label: 'Nombre del Formulario' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllFormsModule();
  }

  getAllFormsModule(): void {
    this._generalService.get<FormModule[]>('FormModule/join').subscribe({
      next: (items) => {
        const rows = (items ?? []).map(it => {
          const mod = (it as any)?.module;
          const frm = (it as any)?.form;
          return {
            ...it,
            moduleName: it.moduleName ?? mod?.name ?? '',
            formName: it.formName ?? frm?.name ?? ''
          } as FormModule;
        });
        this.dataSource.data = rows;
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los Formularios por Módulo.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/formModule-form']);
  }

  goToEdit(form: FormModule): void {
    this.router.navigate(['/formModule-form', form.id]);
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
        this._generalService.delete('FormModule', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            this.getAllFormsModule();
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
        this._generalService.delete('FormModule/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
            this.getAllFormsModule();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
