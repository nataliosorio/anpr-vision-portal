import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Zones } from '../zones';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';

@Component({
  selector: 'app-zones-index',
  imports: [GenericTable],
  templateUrl: './zones-index.html',
  styleUrl: './zones-index.scss'
})
export class ZonesIndex implements OnInit {
  data: Zones[] = [];

  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'parking', label: 'Nombre del Parqueadero' },
    { key: 'asset', label: 'Estado' }
  ];

  private _generalService = inject(General);
  private _loaderService = inject(LoaderService);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllZones();
  }

  getAllZones(): void {
    const parkingId = this._generalService.getParkingId();

    if (!parkingId) {
      Swal.fire('Error', 'No se encontró el ParkingId en localStorage.', 'error');
      this.data = [];
      return;
    }
    this._loaderService.show();
    this._generalService.get<Zones[]>('Zones/join').subscribe({
      next: (zones) => {
        this.data = zones || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las zonas.', 'error');
        this.data = [];
        this._loaderService.hide();
      },
      complete: () => this._loaderService.hide()
    });
  }

  goToCreate(): void {
    this.router.navigate(['/Zones-form']); // minúsculas
  }

  goToEdit(form: Zones): void {
    this.router.navigate(['/Zones-form', form.id]); // minúsculas
  }

  deleteZone(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro lógicamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      background: '#fff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this._loaderService.show();
        this._generalService.delete('Zones', id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El registro ha sido eliminado lógicamente.',
              icon: 'success',
              confirmButtonColor: '#4caf50',
              customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-success-btn'
              }
            });
            this.getAllZones();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
            this._loaderService.hide();
          },
          complete: () => this._loaderService.hide()
        });
      }
    });
  }

  deletePermanentZone(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro permanentemente. Esta acción NO se puede deshacer.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#3085d6',
      background: '#fff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-danger-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this._loaderService.show();
        this._generalService.delete('Zones/permanent', id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado permanentemente!',
              text: 'El registro ha sido eliminado permanentemente.',
              icon: 'success',
              confirmButtonColor: '#4caf50',
              customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-success-btn'
              }
            });
            this.getAllZones();
          },
          error: (err: Error) => {
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
            this._loaderService.hide();
          },
          complete: () => this._loaderService.hide()
        });
      }
    });
  }

}
