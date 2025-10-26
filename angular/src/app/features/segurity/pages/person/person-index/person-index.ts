import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';
import { Person } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-person-prueba',
  imports: [GenericTable],
  templateUrl: './person-index.html',
  styleUrl: './person-index.scss'
})
export class PersonIndex implements OnInit {
  dataSource = new MatTableDataSource<Person>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = [
    { key: 'firstName', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'phoneNumber', label: 'Teléfono' },
    { key: 'asset', label: 'Estado' },
    // { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllPersons();
  }

  getAllPersons(): void {
    this._generalService.get<Person[]>('Person/join').subscribe({
      next: (items) => {
        this.dataSource.data = items || [];
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las personas.', 'error');
        this.dataSource.data = [];
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/persona-form']);
  }

  goToEdit(person: Person): void {
    this.router.navigate(['/persona-form', person.id]);
  }

  deletePerson(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará a la persona',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Person', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La persona ha sido eliminada.', 'success');
            this.getAllPersons();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
          }
        });
      }
    });
  }

  deletePermanentPerson(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará a la persona permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._generalService.delete('Person/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La persona ha sido eliminada permanentemente.', 'success');
            this.getAllPersons();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
          }
        });
      }
    });
  }
}
