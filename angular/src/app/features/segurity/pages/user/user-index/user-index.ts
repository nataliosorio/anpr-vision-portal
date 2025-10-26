/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { User } from 'src/app/shared/Models/Entitys';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-user-index',
  imports: [GenericTable],
  templateUrl: './user-index.html',
  styleUrl: './user-index.scss'
})
export class UserIndex implements OnInit {
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = [
    { key: 'username', label: 'Nombre de Usuario' },
    { key: 'email', label: 'Email' },
    { key: 'personName', label: 'Persona' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllUsers();
  }

getAllUsers(): void {
  this._generalService.get<User[]>('User/join').subscribe({
    next: (items) => {
      const rows = (items ?? []).map(u => {
        const person = (u as any)?.person;
        const computedName = person
          ? `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()
          : '';

        return {
          ...u,
          // Usa el que venga del backend o el calculado desde person.*
          personName: u.personName ?? computedName
        };
      });

      this.dataSource.data = rows;
      if (this.paginator) this.dataSource.paginator = this.paginator;
    },
    error: (err: Error) => {
      Swal.fire('Error', err.message || 'No se pudieron cargar los usuarios.', 'error');
      this.dataSource.data = [];
    }
  });
}


  goToCreate(): void {
    this.router.navigate(['/user-form']);
  }

  goToEdit(user: User): void {
    this.router.navigate(['/user-form', user.id]);
  }

  deleteUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('User', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
            this.getAllUsers();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('User/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado permanentemente.', 'success');
            this.getAllUsers();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
