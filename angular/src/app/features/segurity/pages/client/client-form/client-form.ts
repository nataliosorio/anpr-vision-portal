/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Person, Client, User, RolParkingUser } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm implements OnInit {
  form: FormGroup;
  isEdit = false;
  people: Person[] = [];
  roles: any[] = [];
  createNewPerson = false;
  selectedPersonName = '';
  originalPersonId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      // Control del toggle
      createNewPerson: [false],
      // Persona (condicional)
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      phoneNumber: ['', [Validators.pattern('^[0-9]{7,15}$')]],
      // Persona existente
      personId: [null],
      // Cliente
      clientName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      // Usuario
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
      rolId: [null, [Validators.required]]
    });
  }

  private service = inject(General);
  private loaderService = inject(LoaderService);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    // Si es edición, remover campos que no se usan
    if (this.isEdit) {
      this.form.removeControl('username');
      this.form.removeControl('email');
      this.form.removeControl('password');
      this.form.removeControl('rolId');
      this.form.removeControl('firstName');
      this.form.removeControl('lastName');
      this.form.removeControl('phoneNumber');
      this.form.removeControl('personId');
      this.form.removeControl('createNewPerson');
    }

    // Inicializar validadores según el estado inicial del toggle
    this.toggleCreateNewPerson();

    // Cargar personas
    this.service.get<Person[]>('Person/select').subscribe({
      next: (people) => {
        this.people = people || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las personas.', 'error');
      }
    });

    // Cargar roles
    this.service.get<any[]>('Rol/select').subscribe({
      next: (roles) => {
        this.roles = roles || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error');
      }
    });

    // Si es edición, cargar cliente
    if (this.isEdit && id) {
      this.service.getById<any>('Client', id).subscribe({
        next: (client) => {
          this.loadClientData(client);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo cargar el cliente.', 'error');
          this.router.navigate(['/client-index']);
        }
      });
    }
  }

  toggleCreateNewPerson(): void {
    this.createNewPerson = this.form.get('createNewPerson')?.value || false;
    if (this.createNewPerson) {
      this.form.get('personId')?.setValue(null);
      this.form.get('firstName')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]);
      this.form.get('lastName')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]);
    } else {
      this.form.get('firstName')?.clearValidators();
      this.form.get('lastName')?.clearValidators();
      this.form.get('firstName')?.setValue('');
      this.form.get('lastName')?.setValue('');
      this.form.get('phoneNumber')?.setValue('');
    }
    this.form.get('personId')?.setValidators(this.createNewPerson ? null : [Validators.required]);
    this.form.get('personId')?.updateValueAndValidity();
    this.form.get('firstName')?.updateValueAndValidity();
    this.form.get('lastName')?.updateValueAndValidity();
  }

  private loadClientData(client: any): void {
    this.originalPersonId = client.personId;
    this.form.patchValue({
      clientName: client.name
    });

    // Buscar la persona para mostrar el nombre
    this.service.getById<Person>('Person', client.personId).subscribe({
      next: (person) => {
        this.selectedPersonName = `${person.firstName} ${person.lastName}`;
      },
      error: () => {
        this.selectedPersonName = 'Persona no encontrada';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;

    if (this.isEdit) {
      // En edición, solo actualizar el nombre del cliente
      const clientData = {
        id: this.activatedRoute.snapshot.paramMap.get('id'),
        name: formData.clientName,
        personId: this.originalPersonId,
        asset: true
      };

      this.service.put('Client', clientData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente actualizado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/client-index']);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el cliente', 'error');
        }
      });
    } else {
      // Flujo de creación completo
      this.createCompleteFlow(formData);
    }
  }

  private createCompleteFlow(formData: any): void {
    const personId = formData.personId;

    const createClientAndUser = (personId: number) => {
      // 2. Crear Cliente
      const clientPayload: Partial<Client> = {
        name: formData.clientName,
        personId: personId,
        asset: true
      };

      this.service.post<Client>('Client', clientPayload).subscribe({
        next: () => {
          // 3. Crear Usuario
          const userPayload: Partial<User> = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            personId: personId
          };

          this.service.post<User>('User', userPayload).subscribe({
            next: (createdUser) => {
              // 4. Crear RolParkingUser
              const rolParkingUserPayload: Partial<RolParkingUser> = {
                userId: createdUser.id,
                rolId: formData.rolId,
                parkingId: parseInt(this.service.getParkingId() || '0')
              };

              this.service.post<RolParkingUser>('RolParkingUser', rolParkingUserPayload).subscribe({
                next: () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Cliente creado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                  });
                  this.router.navigate(['/client-index']);
                },
                error: (err: Error) => {
                  Swal.fire('Error', err.message || 'No se pudo crear la relación rol-parqueadero', 'error');
                }
              });
            },
            error: (err: Error) => {
              Swal.fire('Error', err.message || 'No se pudo crear el usuario', 'error');
            }
          });
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear el cliente', 'error');
        }
      });
    };

    if (this.createNewPerson) {
      // 1. Crear nueva persona
      const personPayload: Partial<Person> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
        asset: true
      };

      this.service.post<Person>('Person', personPayload).subscribe({
        next: (createdPerson) => {
          createClientAndUser(createdPerson.id);
        },
        error: (err: Error) => {
          Swal.fire('Error', err.message || 'No se pudo crear la persona', 'error');
        }
      });
    } else {
      // Usar persona existente
      createClientAndUser(personId);
    }
  }

  cancel(): void {
    this.router.navigate(['/client-index']);
  }
}
