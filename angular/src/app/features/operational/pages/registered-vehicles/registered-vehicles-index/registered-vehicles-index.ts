import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { General } from 'src/app/core/services/general.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { VehicleType } from 'src/app/features/parameters/pages/vehicleType/vehicle-type';
import { RegisteredVehicle } from 'src/app/shared/Models/Entitys';

// Interface for the new response with PDF
interface ManualEntryResponseDto extends RegisteredVehicle {
  ticketPdfBytes: string;
}

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registered-vehicles-index',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, MatPaginator, DatePipe, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './registered-vehicles-index.html',
  styleUrl: './registered-vehicles-index.scss'
})
export class RegisteredVehiclesIndex implements OnInit {
  dataSource = new MatTableDataSource<RegisteredVehicle>();
  originalData: RegisteredVehicle[] = [];
  selectedFilter: string = 'all';
  entryExitFilter: string = 'entries'; // 'entries' or 'exits'
  pagedData: RegisteredVehicle[] = [];

  vehicleTypes: VehicleType[] = [];
  manualEntryForm: FormGroup;

  columns = [
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'entryDate', label: 'Fecha de Entrada' },
    { key: 'exitDate', label: 'Fecha de Salida' },
    { key: 'slots', label: 'Slot' },
    { key: 'isDeleted', label: 'Eliminado Lógicamente' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('manualEntryDialog') manualEntryDialogTemplate!: TemplateRef<any>;

  private _generalService = inject(General);
  private _loaderService = inject(LoaderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  constructor() {
    this.manualEntryForm = this.fb.group({
       plate: [
             '',
             [
               Validators.required,
               Validators.pattern(/^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/)
             ]
           ],
      parkingId: [this._generalService.getParkingId() ? parseInt(this._generalService.getParkingId()!) : null, [Validators.required, Validators.min(1)]],
      typeVehicleId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this._loaderService.show();
    this.getAllEntries();
    this.loadVehicleTypes();
  }

  loadVehicleTypes(): void {
    this._generalService.get<VehicleType[]>('TypeVehicle/select').subscribe({
      next: (vehicleTypes) => {
        this.vehicleTypes = vehicleTypes || [];
      },
      error: (err: Error) => {
        console.error('Error loading vehicle types:', err);
        this._loaderService.hide();
      },
      complete: () => {
        // Las otras llamadas en ngOnInit no tienen complete, así que aquí ocultamos el loader
        this._loaderService.hide();
      }
    });
  }

  getAllEntries(): void {
    this._generalService.get<RegisteredVehicle[]>('RegisteredVehicles/join').subscribe({
      next: (items) => {
        this.originalData = items || [];
        // Aplicar filtro por defecto (entradas activas)
        const filteredData = this.originalData.filter(e => !e.exitDate && !e.isDeleted);
        this.dataSource.data = filteredData;
        this.applyPagination(); // ✅ inicializar con la primera página
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar las entradas.', 'error');
        this.originalData = [];
        this.dataSource.data = [];
        this.pagedData = [];
        this._loaderService.hide();
      }
    });
  }

  goToCreate(): void {
    this.openManualEntryDialog();
  }

  openManualEntryDialog(): void {
    this.manualEntryForm.reset();
    // Set parkingId from localStorage
    const parkingId = this._generalService.getParkingId();
    if (parkingId) {
      this.manualEntryForm.patchValue({ parkingId: parseInt(parkingId) });
    }
    const dialogRef = this.dialog.open(this.manualEntryDialogTemplate, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'submit') {
        this.submitManualEntry();
      }
    });
  }

  submitManualEntry(): void {
    if (this.manualEntryForm.valid) {
      const formValue = this.manualEntryForm.value;
      const data = {
        plate: formValue.plate.trim().toUpperCase(),
        parkingId: formValue.parkingId,
        typeVehicleId: formValue.typeVehicleId
      };

      this._loaderService.show();
      this._generalService.post<ManualEntryResponseDto>('RegisteredVehicles/manual-entry', data).subscribe({
        next: (response: ManualEntryResponseDto) => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Entrada manual registrada correctamente.',
            icon: 'success',
            confirmButtonColor: '#4caf50'
          }).then(() => {
            // Abrir el PDF en una nueva pestaña
            this.openPdfInNewTab(response.ticketPdfBytes);
          });
          this.getAllEntries(); // Recargar la lista
        },
        error: (err: Error) => {
          // El general.service.ts ya extrae el message del ApiResponse
          const errorMessage = err.message || 'Error al procesar la entrada manual.';
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
          this._loaderService.hide();
        },
        complete: () => this._loaderService.hide()
      });
    }
  }

  private openPdfInNewTab(base64Pdf: string): void {
    try {
      // Convertir base64 a bytes
      const pdfBytes = this.base64ToArrayBuffer(base64Pdf);

      // Crear blob con tipo MIME de PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Crear URL del blob
      const pdfUrl = URL.createObjectURL(blob);

      // Abrir en nueva pestaña
      window.open(pdfUrl, '_blank');

      // Limpiar la URL del blob después de un tiempo para liberar memoria
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000); // 10 segundos
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo abrir el ticket PDF.',
        icon: 'warning',
        confirmButtonColor: '#ff9800'
      });
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  goToEdit(entry: RegisteredVehicle): void {
    this.router.navigate(['/registered-vehicles-form', entry.id]);
  }

  deleteEntry(id: number): void {
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
        this._generalService.delete('RegisteredVehicles', id).subscribe({
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
            this.getAllEntries();
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

  deletePermanentEntry(id: number): void {
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
        this._generalService.delete('RegisteredVehicles/permanent', id).subscribe({
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
            this.getAllEntries();
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

  // Estadísticas del header
  getTotalEntries(): number {
    return this.originalData.length;
  }

  getActiveEntries(): number {
    return this.originalData.filter(e => !e.exitDate && !e.isDeleted).length;
  }

  getExitedEntries(): number {
    return this.originalData.filter(e => e.exitDate && !e.isDeleted).length;
  }

  // Búsqueda + filtros
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    let filteredData = this.originalData;

    // Si hay búsqueda, mostrar resultados de todos los datos
    if (filterValue) {
      filteredData = filteredData.filter(e =>
        e.vehicle?.toLowerCase().includes(filterValue) ||
        e.entryDate?.toLowerCase().includes(filterValue) ||
        e.slots?.toLowerCase().includes(filterValue)
      );
    } else {
      // Si no hay búsqueda, aplicar el filtro activo
      filteredData = this.applyStatusFilter(filteredData);
    }

    this.dataSource.data = filteredData;
    this.applyPagination(); // ✅ aplicar paginación después del filtro
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;

    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredData = this.originalData;

    if (searchValue) {
      filteredData = filteredData.filter(e =>
        e.vehicle?.toLowerCase().includes(searchValue) ||
        e.entryDate?.toLowerCase().includes(searchValue) ||
        e.slots?.toLowerCase().includes(searchValue)
      );
    }

    filteredData = this.applyStatusFilter(filteredData);

    this.dataSource.data = filteredData;
    this.applyPagination(); // ✅ aplicar paginación después del filtro
  }

  setEntryExitFilter(filter: string): void {
    this.entryExitFilter = filter;
    this.selectedFilter = filter === 'entries' ? 'active' : 'exited';

    // Verificar si hay búsqueda activa
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const searchValue = searchInput ? searchInput.value.trim() : '';

    let filteredData = this.originalData;

    // Si hay búsqueda, mostrar todos los resultados que coincidan
    if (searchValue) {
      filteredData = filteredData.filter(e =>
        e.vehicle?.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.entryDate?.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.slots?.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      // Si no hay búsqueda, aplicar el filtro de status
      filteredData = this.applyStatusFilter(filteredData);
    }

    this.dataSource.data = filteredData;
    this.applyPagination();
  }

  private applyStatusFilter(data: RegisteredVehicle[]): RegisteredVehicle[] {
    switch (this.selectedFilter) {
      case 'active':
        return data.filter(e => !e.exitDate && !e.isDeleted);
      case 'exited':
        return data.filter(e => e.exitDate && !e.isDeleted);
      case 'deleted':
        return data.filter(e => e.isDeleted);
      case 'all':
      default:
        return data;
    }
  }

  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pagedData = this.dataSource.data.slice(startIndex, endIndex);
  }

  private applyPagination() {
    // siempre resetear a la primera página con tamaño 5
    this.pagedData = this.dataSource.data.slice(0, 5);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getVehicleTypeIcon(typeName: string): string {
    const iconMap: { [key: string]: string } = {
      'Carro': 'directions_car',
      'Moto': 'motorcycle',
      'Camión': 'local_shipping',
      'Camion': 'local_shipping',
      'Bicicleta': 'pedal_bike',
      'Scooter': 'electric_scooter'
    };
    return iconMap[typeName] || 'directions_car';
  }

  getSelectedVehicleTypeName(): string {
    const selectedId = this.manualEntryForm.get('typeVehicleId')?.value;
    const selectedType = this.vehicleTypes.find(type => type.id === selectedId);
    return selectedType ? selectedType.name : '';
  }

  viewTicket(entry: RegisteredVehicle): void {
    this._loaderService.show();
    this._generalService.get<{ ticketPdfBytes: string }>(`RegisteredVehicles/ticket/${entry.id}`).subscribe({
      next: (response) => {
        this.openPdfInNewTab(response.ticketPdfBytes);
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudo obtener el ticket', 'error');
        this._loaderService.hide();
      },
      complete: () => this._loaderService.hide()
    });
  }

  registerExit(entry: RegisteredVehicle): void {
    Swal.fire({
      title: '¿Confirmar salida?',
      text: `¿Está seguro de registrar la salida del vehículo ${entry.vehicle}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar salida',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this._loaderService.show();
        this._generalService.put(`RegisteredVehicles/exit/${entry.id}`, {}).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Salida registrada!',
              text: 'La salida del vehículo ha sido registrada exitosamente.',
              icon: 'success',
              confirmButtonColor: '#4caf50'
            });
            this.getAllEntries(); // Recargar la lista
          },
          error: (err: Error) => {
            Swal.fire('Error', err.message || 'No se pudo registrar la salida', 'error');
            this._loaderService.hide();
          },
          complete: () => this._loaderService.hide()
        });
      }
    });
  }
}
