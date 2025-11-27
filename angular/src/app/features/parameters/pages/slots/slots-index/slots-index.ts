import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Slots } from '../slots';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';

@Component({
  selector: 'app-slots-index',
  imports: [GenericTable],
  templateUrl: './slots-index.html',
  styleUrl: './slots-index.scss'
})
export class SlotsIndex implements OnInit {
  data: Slots[] = [];

  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'sectors', label: 'Sector' },
    { key: 'isAvailable', label: 'Disponibilidad' },
    { key: 'asset', label: 'Estado' }
  ];

  private _generalService = inject(General);
  private _loaderService = inject(LoaderService);
  private router = inject(Router);

  constructor() {}
 ngOnInit(): void {
    this.getAllSlots();
  }

getAllSlots(): void {
  this._loaderService.show();
  this._generalService.get<Slots[]>('Slots/join').subscribe({
    next: (data) => {
      this.data = data ?? [];
    },
    error: (err: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar Slots',
        text: err.message ?? 'No fue posible obtener la lista de slots.'
      });
      this.data = [];
      this._loaderService.hide();
    },
    complete: () => this._loaderService.hide()
  });
}

goToCreate(): void {
  this.router.navigate(['/slots-form']);
}

goToEdit(form: Slots): void {
  this.router.navigate(['/slots-form', form.id]);
}


deleteSlot(id: number): void {
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
      this._generalService.delete('Slots', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
          this.getAllSlots();
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

deletePermanentSlot(id: number): void {
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
      this._generalService.delete('Slots/permanent', id).subscribe({
        next: () => {
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado permanentemente.', 'success');
          this.getAllSlots();
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
