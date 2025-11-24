/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { debounceTime, map, switchMap, catchError } from 'rxjs/operators';

import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { Person, Client, User, RolParkingUser } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-client-temp-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './client-temp-form.html',
  styleUrl: './client-temp-form.scss'
})
export class ClientTempForm implements OnInit {
  form: FormGroup;
  roles: { id: number; name: string }[] = [];
  selectedRoleId: number | null = null;

  private service = inject(General);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientTempForm>
  ) {
    this.form = this.fb.group({
      // persona
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      phoneNumber: ['', [Validators.pattern('^[0-9]{7,15}$')]],
      // cliente
      clientName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      // usuario
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)], [this.usernameExistsValidator()]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)], [this.emailExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      // rol
      rolId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllRoles();
  }

  getAllRoles(): void {
    this.service.get<Array<{ id: number; name: string }>>('Rol/select').subscribe({
      next: (roles) => {
        this.roles = roles || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error');
      }
    });
  }

  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value?.trim()) return of(null);

      return of(control.value).pipe(
        debounceTime(300),
        switchMap(username => {
          const params = new HttpParams().set('username', username);
          return this.service.get<any>('User/check-username', params).pipe(
            map(res => {
              const exists = typeof res === 'boolean' ? res : !!res?.exists;
              return exists ? { usernameExists: true } : null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value?.trim()) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(email => {
          const params = new HttpParams().set('email', email);
          return this.service.get<any>('User/check-email', params).pipe(
            map(res => {
              const exists = typeof res === 'boolean' ? res : !!res?.exists;
              return exists ? { emailExists: true } : null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, phoneNumber, clientName, userName, email, password, rolId } = this.form.value;

    // 🔹 Paso 1: Crear Persona
    const personPayload: Partial<Person> = { firstName, lastName, phoneNumber };

    this.service.post<Person>('Person', personPayload).subscribe({
      next: (createdPerson) => {
        // 🔹 Paso 2: Crear Cliente
        const clientPayload: Partial<Client> = {
          name: clientName,
          personId: createdPerson.id
        };

        this.service.post<Client>('Client', clientPayload).subscribe({
          next: (createdClient) => {
            // 🔹 Paso 3: Crear Usuario
            const userPayload: Partial<User> = {
              username: userName,
              email,
              password,
              personId: createdPerson.id
            };

            this.service.post<User>('User', userPayload).subscribe({
              next: (createdUser) => {
                // 🔹 Paso 4: Crear RolParkingUser
                const parkingIdStr = this.service.getParkingId();
                const parkingId = parkingIdStr ? parseInt(parkingIdStr, 10) : null;
                if (!parkingId) {
                  this.dialogRef.close();
                  Swal.fire('Error', 'No se pudo obtener el ID del parqueadero', 'error');
                  return;
                }
                const rolParkingUserPayload: Partial<RolParkingUser> = {
                  userId: createdUser.id,
                  userName: createdUser.username,
                  rolId,
                  rolName: this.roles.find(r => r.id === rolId)?.name || '',
                  parkingId,
                  parkingName: '' // Podría obtenerse del servicio si es necesario
                };

                this.service.post<RolParkingUser>('RolParkingUser', rolParkingUserPayload).subscribe({
                  next: () => {
                    this.dialogRef.close(createdClient);
                    Swal.fire({
                      icon: 'success',
                      title: 'Cliente y usuario creados exitosamente',
                      timer: 2000,
                      showConfirmButton: false
                    });
                  },
                  error: (err: Error) => {
                    this.dialogRef.close();
                    Swal.fire('Error', err.message || 'No se pudo asignar el rol al usuario', 'error');
                  }
                });
              },
              error: (err: Error) => {
                const msg = (err?.message || '').toLowerCase();
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
                this.dialogRef.close();
                Swal.fire('Error', err.message || 'No se pudo crear el usuario', 'error');
              }
            });
          },
          error: (err: Error) => {
            this.dialogRef.close();
            Swal.fire('Error', err.message || 'No se pudo crear el cliente', 'error');
          }
        });
      },

      error: (err: Error) => {
        this.dialogRef.close();
        Swal.fire('Error', err.message || 'No se pudo crear la persona', 'error');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
