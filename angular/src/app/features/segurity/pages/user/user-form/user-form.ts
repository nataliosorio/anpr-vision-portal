/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpParams } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { of } from 'rxjs';
import { debounceTime, map, switchMap, catchError } from 'rxjs/operators';
import { General } from 'src/app/core/services/general.service';
import { User } from 'src/app/shared/Models/Entitys';

/* --- VALIDADORES ASÍNCRONOS (compatibles con General que retorna T directo) --- */
export function usernameExistsValidator(service: General, getUserId: () => string | null): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value?.trim()) return of(null);

    return of(control.value).pipe(
      debounceTime(300),
      switchMap(username => {
        const params = new HttpParams().set('username', username);
        return service.get<any>('User/check-username', params).pipe(
          map(res => {
            // Soporta boolean directo o { exists: boolean }
            const exists = typeof res === 'boolean' ? res : !!res?.exists;
            const currentId = getUserId() ?? control.parent?.get('id')?.value ?? null;
            return exists && control.parent?.get('id')?.value !== currentId ? { usernameExists: true } : null;
          }),
          catchError(() => of(null)) // si falla la API, no bloquea
        );
      })
    );
  };
}

export function emailExistsValidator(service: General, getUserId: () => string | null): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value?.trim()) return of(null);

    return of(control.value).pipe(
      debounceTime(400),
      switchMap(email => {
        const currentUserId = getUserId() ?? '';
        const params = new HttpParams().set('email', email).set('currentUserId', currentUserId);
        return service.get<any>('User/check-email', params).pipe(
          map(res => {
            const exists = typeof res === 'boolean' ? res : !!res?.exists;
            const currentId = getUserId() ?? control.parent?.get('id')?.value ?? null;
            return exists && control.parent?.get('id')?.value !== currentId ? { emailExists: true } : null;
          }),
          catchError(() => of(null))
        );
      })
    );
  };
}

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatIcon
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnInit {
  [x: string]: any;
  form: FormGroup;
  isEdit = false;
  persons: { id: number; firstName: string; lastName?: string }[] = [];
  originalPassword: string = '';
  roles: { id: number; name: string }[] = [];
  selectedRoleId: number | null = null;
  rolUserAsset: boolean = true;
  userRoles: any[] = [];
  editIndex: number | null = null;

  private FormBuilder = inject(FormBuilder);
  private ActivatedRoute = inject(ActivatedRoute);
  private route = inject(Router);
  private service = inject(General);
  userId: string = '';

  constructor() {
    this.form = this.FormBuilder.group({
      id: [null],
      userName: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(30)],
        [usernameExistsValidator(this.service, () => this.userId)]
      ],
      email: [
        '',
        [Validators.required, Validators.email],
        [emailExistsValidator(this.service, () => this.userId)]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        ]
      ],
      personId: ['', Validators.required],
      asset: [true],
      // el template usa hidePassword → lo agregamos
      hidePassword: [true]
    });
  }

  onCancelar(): void {
    this.route.navigate(['/user-index']);
  }

  ngOnInit(): void {
    this.getAllPersons();

    const id = this.ActivatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit && id) {
      this.userId = id;
      this.getAllRoles();
      this.loadUserRoles(id);

      // En edición la contraseña no es obligatoria
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.service.getById<User>('User', id).subscribe({
        next: (user) => {
          const userData = { ...user, password: '' };
          this.originalPassword = user.password ?? '';
          this.form.patchValue(userData);

          // Revalidar asincrónicos con el userId cargado
          this.form.get('userName')?.updateValueAndValidity();
          this.form.get('email')?.updateValueAndValidity();
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el usuario.', 'error');
          this.route.navigate(['/user-index']);
        }
      });
    }
  }

  getAllPersons(): void {
    this.service.get<Array<{ id: number; firstName: string; lastName?: string }>>('Person/select').subscribe({
      next: (people) => {
        this.persons = people || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las personas.', 'error');
      }
    });
  }

  getAllRoles(): void {
    this.service.get<Array<{ id: number; name: string }>>('Rol/select').subscribe({
      next: (roles) => (this.roles = roles || []),
      error: (err: Error) => Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error')
    });
  }

  loadUserRoles(userId: string) {
    this.service.get<any[]>(`User/roles/${userId}`).subscribe({
      next: (items) => {
        const list = items || [];
        this.userRoles = list.map((role: any) => ({
          ...role,
          asset: Boolean(role.asset)
        }));
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles del usuario.', 'error');
      }
    });
  }

  onDeleteRole(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete('RolUser/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
            this.loadUserRoles(this.userId);
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar el rol', text: err.message });
          }
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = { ...this.form.value };

    if (this.isEdit) {
      if (!data.password) data.password = this.originalPassword;
    } else {
      delete data.id;
    }

    const request$ = this.isEdit ? this.service.put('User', data) : this.service.post('User', data);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEdit ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.route.navigate(['/user-index']);
      },
      error: (err: Error) => {
        const msg = (err?.message || '').toLowerCase();

        // Mapea mensajes del back a errores de campo
        if (msg.includes('correo') || msg.includes('email')) {
          this.form.get('email')?.setErrors({ emailExists: true });
          this.form.get('email')?.markAsTouched();
          return;
        }
        if (msg.includes('usuario') || msg.includes('username')) {
          this.form.get('userName')?.setErrors({ usernameExists: true });
          this.form.get('userName')?.markAsTouched();
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error',
          text: err.message || 'Por favor, intenta de nuevo más tarde.'
        });
      }
    });
  }

  assignRole(): void {
    const userId = this.form.get('id')?.value;
    const rolId = this.selectedRoleId;
    const asset = this.rolUserAsset;

    if (userId && rolId != null) {
      const payload = { userId, rolId, asset };
      this.service.post('RolUser', payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Rol asignado correctamente',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.loadUserRoles(userId);
        },
        error: (err: Error) => {
          Swal.fire({ icon: 'error', title: 'No se pudo asignar el rol', text: err.message });
        }
      });
    }
  }

  cancel(): void {
    this.route.navigate(['/user-index']);
  }
}
