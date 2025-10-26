/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RolFormPermission } from '../rol-form-permission';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-rol-form-per-index',
  imports: [GenericTable],
  templateUrl: './rol-form-per-index.html',
  styleUrl: './rol-form-per-index.scss'
})
export class RolFormPerIndex implements OnInit {
  dataSource = new MatTableDataSource<RolFormPermission>();
  columns = [
    { key: 'rolName', label: 'Rol' },
    { key: 'permissionName', label: 'Permiso' },
    { key: 'formName', label: 'Formulario' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllRolFormPermission();
  }

  getAllRolFormPermission(): void {
    this._generalService.get<RolFormPermission[]>('RolFormPermission/join').subscribe({
      next: (items) => {
        const rows = (items ?? []).map(it => {
          const rol = (it as any)?.rol;
          const perm = (it as any)?.permission;
          const form = (it as any)?.form;
          return {
            ...it,
            rolName: it.rolName ?? rol?.name ?? '',
            permissionName: it.permissionName ?? perm?.name ?? '',
            formName: it.formName ?? form?.name ?? ''
          } as RolFormPermission;
        });

        this.dataSource.data = rows;
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los registros.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/rolFormPermission-form']);
  }

  goToEdit(form: RolFormPermission): void {
    this.router.navigate(['/rolFormPermission-form', form.id]);
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
        this._generalService.delete('RolFormPermission', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            this.getAllRolFormPermission();
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
        this._generalService.delete('RolFormPermission/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
            this.getAllRolFormPermission();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
