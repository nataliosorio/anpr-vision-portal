/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { General } from 'src/app/core/services/general.service';
import { RolParkingUser } from 'src/app/shared/Models/Entitys';
import { GenericForm } from 'src/app/shared/components/ui-element/generic-form/generic-form';
import { FieldConfig } from 'src/app/shared/components/ui-element/generic-form/field-config.model';

@Component({
  selector: 'app-rol-parking-user-form',
  imports: [CommonModule, GenericForm],
  templateUrl: './rol-parking-user-form.html',
  styleUrl: './rol-parking-user-form.scss'
})
export class RolParkingUserForm implements OnInit {
  config: FieldConfig[] = [];
  isEdit = false;
  initialData: any = {};
  title = '';
  users: { id: number; username: string }[] = [];
  roles: { id: number; name: string }[] = [];
  parkings: { id: number; name: string }[] = [];

  private ActivatedRoute = inject(ActivatedRoute);
  private route = inject(Router);
  private service = inject(General);

  ngOnInit(): void {
    const id = this.ActivatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.title = this.isEdit ? 'Editar Rol Parking User' : 'Crear Rol Parking User';

    // Construir la configuración del formulario inicialmente (con opciones vacías).
    // Luego cada llamada a getAllX() actualizará las opciones con `updateConfig()`.
    this.buildConfig();

    this.getAllUsers();
    this.getAllRoles();
    this.getAllParkings();

    if (this.isEdit && id) {
      this.service.getById<RolParkingUser>('RolParkingUser', id).subscribe({
        next: (rolParkingUser) => {
          this.initialData = this.normalize(rolParkingUser);
          // Intentar asegurar que la config se reconstruya (trigger ngOnChanges)
          this.updateConfig();
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el registro.', 'error');
            this.route.navigateByUrl('/rol-parking-user-index');
        }
      });
    }
  }

  private normalize(r: any) {
    return {
      id: r?.id,
      userId: r?.userId ?? r?.user?.id ?? r?.user?.userId ?? null,
      rolId: r?.rolId ?? r?.rol?.id ?? r?.role?.id ?? null,
      parkingId: r?.parkingId ?? r?.parking?.id ?? null,
      asset: r?.asset ?? r?.activo ?? true
    };
  }

  getAllUsers(): void {
    this.service.get<Array<{ id: number; username: string }>>('User/select').subscribe({
      next: (users) => {
        this.users = users || [];
        this.updateConfig();
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los usuarios.', 'error');
      }
    });
  }

  getAllRoles(): void {
    this.service.get<Array<{ id: number; name: string }>>('Rol/select').subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.updateConfig();
      },
      error: (err: Error) => Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error')
    });
  }

  getAllParkings(): void {
    this.service.get<Array<{ id: number; name: string }>>('Parking/select').subscribe({
      next: (parkings) => {
        this.parkings = parkings || [];
        this.updateConfig();
      },
      error: (err: Error) => Swal.fire('Error', err.message || 'No se pudieron cargar los parqueaderos.', 'error')
    });
  }

  private updateConfig(): void {
    // Asegurarse de que la config exista antes de intentar setear opciones
    if (!this.config || this.config.length === 0) {
      this.buildConfig();
    }

    // Setear opciones en los selects (siempre comprobar existencia por seguridad)
    if (this.config[0]) this.config[0].options = this.users.map(u => ({ value: u.id, label: u.username }));
    if (this.config[1]) this.config[1].options = this.roles.map(r => ({ value: r.id, label: r.name }));
    if (this.config[2]) this.config[2].options = this.parkings.map(p => ({ value: p.id, label: p.name }));

    // Reasignar referencia para que Angular detecte el cambio y GenericForm reciba ngOnChanges
    this.config = [...this.config];
  }

  onSave(data: any): void {
    const request$ = this.isEdit ? this.service.put('RolParkingUser', data) : this.service.post('RolParkingUser', data);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEdit ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/rol-parking-user-index']);
      },
      error: (err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error',
          text: err.message || 'Por favor, intenta de nuevo más tarde.'
        });
      }
    });
  }

  onCancel(): void {
     this.route.navigateByUrl('/rol-parking-user-index');
  }

  private buildConfig(): void {
    this.config = [
      {
        name: 'userId',
        label: 'Usuario',
        type: 'select',
        required: true,
        options: this.users.map(u => ({ value: u.id, label: u.username }))
      },
      {
        name: 'rolId',
        label: 'Rol',
        type: 'select',
        required: true,
        options: this.roles.map(r => ({ value: r.id, label: r.name }))
      },
      {
        name: 'parkingId',
        label: 'Parqueadero',
        type: 'select',
        required: true,
        options: this.parkings.map(p => ({ value: p.id, label: p.name }))
      },
      {
        name: 'asset',
        label: 'Activo',
        type: 'toggle',
        value: true,
        // Mostrar toggle solo en edición
        hidden: !this.isEdit
      }
    ];
  }
}
