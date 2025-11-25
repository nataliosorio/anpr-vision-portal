import { Component, inject, OnInit } from '@angular/core';
import { Sectors } from '../sectors';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';

@Component({
  selector: 'app-sectors-index',
  imports: [GenericTable],
  templateUrl: './sectors-index.html',
  styleUrl: './sectors-index.scss'
})
export class SectorsIndex implements OnInit {
  data: Sectors[] = [];

  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'capacity', label: 'Capacidad' },
    { key: 'zones', label: 'Zona' },
    { key: 'typeVehicle', label: 'Tipo de Vehículo' },
    { key: 'asset', label: 'Estado' }
  ];

  private _generalService = inject(General);
  private _loaderService = inject(LoaderService);
  private router = inject(Router);

  constructor() {}
 ngOnInit(): void {
   this.getAllSectors();
 }

getAllSectors(): void {
  this._loaderService.show();
  this._generalService.get<Sectors[]>('Sectors/join').subscribe({
    next: (sectors) => {
      this.data = sectors || [];
    },
    error: (e) => {
      Swal.fire('Error', e.message || 'No se pudo cargar sectores', 'error');
      this.data = [];
      this._loaderService.hide();
    },
    complete: () => this._loaderService.hide()
  });
}


goToCreate(): void {
  this.router.navigate(['/sectors-form']);
}

goToEdit(form: Sectors): void {
  this.router.navigate(['/sectors-form', form.id]);
}


deleteSector(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el registro.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this._loaderService.show();
      this._generalService.delete('Sectors', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
          this.getAllSectors();
        },
        error: (err: Error) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: err.message
          });
          this._loaderService.hide();
        },
        complete: () => this._loaderService.hide()
      });
    }
  });
}

deletePermanentSector(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el registro permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this._loaderService.show();
      this._generalService.delete('Sectors/permanent', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
          this.getAllSectors();
        },
        error: (err: Error) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar permanentemente',
            text: err.message
          });
          this._loaderService.hide();
        },
        complete: () => this._loaderService.hide()
      });
    }
  });
}

}
