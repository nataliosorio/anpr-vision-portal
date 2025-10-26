/* eslint-disable @angular-eslint/prefer-inject */
import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { Person } from 'src/app/shared/Models/Entitys';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-person-dialog-component',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './edit-person-dialog-component.html',
  styleUrl: './edit-person-dialog-component.scss'
})
export class EditPersonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditPersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Person
  ) {}

  private service = inject(General);
  private route = inject(Router);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {

    if (!this.data.firstName || this.data.firstName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa tu nombre'
      });
      return;
    }

    if (!this.data.lastName || this.data.lastName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa tu apellido'
      });
      return;
    }

    if (!this.data.phone || this.data.phone.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa tu número de teléfono'
      });
      return;
    }


    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(this.data.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Número inválido',
        text: 'El número de teléfono debe tener entre 7 y 15 dígitos'
      });
      return;
    }


    this.service.put('Person', this.data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro actualizado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        this.dialogRef.close('updated');
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'Ocurrió un problema, intenta de nuevo más tarde'
        });
      }
    });
  }
}
