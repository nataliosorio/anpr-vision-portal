/* eslint-disable @angular-eslint/prefer-inject */
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { General } from 'src/app/core/services/general.service';
import { User } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-edit-user-dialog-component',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './edit-user-dialog-component.html',
  styleUrl: './edit-user-dialog-component.scss'
})
export class EditUserDialogComponent {
 constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  private service = inject(General);
  private route = inject(Router);


  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
      // this.dialogRef.close();

    this.service.put('User', this.data).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Registro actualizado exitosamente',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
         this.dialogRef.close('updated');
        // this.route.navigate(['/profile-index']);
      });
  }
}
