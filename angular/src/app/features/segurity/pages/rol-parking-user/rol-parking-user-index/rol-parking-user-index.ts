/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { RolParkingUser } from 'src/app/shared/Models/Entitys';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-rol-parking-user-index',
  imports: [GenericTable],
  templateUrl: './rol-parking-user-index.html',
  styleUrl: './rol-parking-user-index.scss'
})
export class RolParkingUserIndex implements OnInit {
  dataSource = new MatTableDataSource<RolParkingUser>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = [
    { key: 'userName', label: 'Usuario' },
    { key: 'rolName', label: 'Rol' },
    { key: 'parkingName', label: 'Parqueadero' },
    { key: 'asset', label: 'Estado' },
  ];

  private _generalService = inject(General);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.getAllRolParkingUsers();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.getAllRolParkingUsers();
      }
    });
  }

  getAllRolParkingUsers(): void {
    this._generalService.get<RolParkingUser[]>('RolParkingUser/join').subscribe({
      next: (items) => {
        this.dataSource.data = items ?? [];
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles de parqueadero por usuario.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigateByUrl('/rol-parking-user-form');
  }

  goToEdit(rolParkingUser: RolParkingUser): void {
    this.router.navigateByUrl(`/rol-parking-user-form/${rolParkingUser.id}`);
  }

  deleteRolParkingUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol de parqueadero para el usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar eliminación permanente
        this._generalService.delete('RolParkingUser/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El rol de parqueadero para el usuario ha sido eliminado permanentemente.', 'success');
            this.getAllRolParkingUsers();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentRolParkingUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente el rol de parqueadero para el usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('RolParkingUser/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El rol de parqueadero para el usuario ha sido eliminado permanentemente.', 'success');
            this.getAllRolParkingUsers();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
