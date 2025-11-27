import { Component, inject, OnInit } from '@angular/core';
import { RateType } from '../rate-type';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { GenericTable } from 'src/app/shared/components/ui-element/generic-table/generic-table';

@Component({
  selector: 'app-rate-type-index',
  imports: [GenericTable],
  templateUrl: './rate-type-index.html',
  styleUrl: './rate-type-index.scss'
})
export class RateTypeIndex implements OnInit {
  data: RateType[] = [];

  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'asset', label: 'Estado' }
  ];

  private _generalService = inject(General);
  private _loaderService = inject(LoaderService);
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllTypeRates();
  }

  getAllTypeRates(): void {
    this._loaderService.show();
    this._generalService.get<RateType[]>('RatesType/select').subscribe({
      next: (items) => {
        this.data = items || [];
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los tipos de tarifa.', 'error');
        this.data = [];
        this._loaderService.hide();
      },
      complete: () => this._loaderService.hide()
    });
  }

  goToCreate(): void {
    this.router.navigate(['/RatesType-form']);
  }

  goToEdit(item: RateType): void {
    this.router.navigate(['/RatesType-form', item.id]);
  }

  deleteRateType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de tarifa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._loaderService.show();
        this._generalService.delete('RatesType', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de tarifa ha sido eliminado.', 'success');
            this.getAllTypeRates();
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

  deletePermanentRateType(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de tarifa permanentemente.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._loaderService.show();
        this._generalService.delete('RatesType/permanent', id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El tipo de tarifa ha sido eliminado permanentemente.', 'success');
            this.getAllTypeRates();
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
