/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { Person, Client } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-client-temp-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './client-temp-form.html',
  styleUrl: './client-temp-form.scss'
})
export class ClientTempForm {
  form: FormGroup;

  private service = inject(General);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientTempForm>
  ) {
    this.form = this.fb.group({
      // persona
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$')]],
      phoneNumber: ['', [Validators.pattern('^[0-9]{7,15}$')]],
      // cliente
      clientName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { firstName, lastName, phoneNumber, clientName } = this.form.value;

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
            Swal.fire({
              icon: 'success',
              title: 'Cliente creado exitosamente',
              timer: 2000,
              showConfirmButton: false
            });
            this.dialogRef.close(createdClient); // 🚀 devolvemos cliente
          },
          error: (err: Error) => {
            Swal.fire('Error', err.message || 'No se pudo crear el cliente', 'error');
          }
        });
      },

      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudo crear la persona', 'error');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
