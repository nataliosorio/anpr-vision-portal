import { Component, inject, OnInit } from '@angular/core';
// medical-profile.module.ts
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../edit-user-dialog-component/edit-user-dialog-component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditPersonDialogComponent } from '../edit-person-dialog-component/edit-person-dialog-component';
import { General } from 'src/app/core/services/general.service';
import { User, Person } from 'src/app/shared/Models/Entitys';


@Component({
  selector: 'app-profile-index',
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
  FormsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule
],
  templateUrl: './profile-index.html',
  styleUrl: './profile-index.scss'
})
export class ProfileIndex implements OnInit {
  userName: string | null = null;
  userData!: User;
  personData!: Person;

  private service = inject(General);
  private dialog = inject(MatDialog);



  userId: string | null = null;
  userid!: number;


   ngOnInit(): void {
    this.userName = this.service.getUsername();
    this.userId = this.service.getUserId();
    this.userid = Number(this.userId);
    // const userid = Number(this.userId);
    this.loadUser(this.userid);

  }

  get firstLetter(): string {
  return this.userName
    ? this.userName.charAt(0).toUpperCase()
    : '';
}

loadUser(id: number): void {
  this.service.getById<{ success: boolean; data: User }>('User', id).subscribe({
    next: (res) => {
      this.userData = res.data;
      console.log('Usuario cargado:', this.userData);

      // Aquí cargamos la persona
      if (this.userData.personId) {
        this.loadPerson(this.userData.personId);
      }
    },
    error: (err) => {
      console.error('Error al obtener usuario', err);
    }
  });
}



  loadPerson(id: number): void {
    this.service.getById<{ success: boolean; data: Person }>('Person', id).subscribe({
      next: (res) => {
        this.personData = res.data;
        console.log('Persona cargado:', this.personData);
      },
      error: (err) => {
        console.error('Error al obtener usuario', err);
      }
    });
  }

   openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px',
      data: { ...this.userData } // Enviamos copia de los datos
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
      this.loadUser(this.userid); // <-- tu función que trae los datos
    }
    });
  }


   openEditPersonDialog(): void {
    const dialogRef = this.dialog.open(EditPersonDialogComponent, {
      width: '400px',
      data: { ...this.personData } // Enviamos copia de los datos
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
      this.loadUser(this.userid); // <-- tu función que trae los datos
    }
    });
  }












  editProfile() {
    console.log('Edit profile clicked');
    // Aquí implementarías la lógica de edición
  }





}
