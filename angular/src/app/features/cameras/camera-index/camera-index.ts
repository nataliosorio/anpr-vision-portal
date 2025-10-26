/* eslint-disable @angular-eslint/prefer-inject */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { Camera } from 'src/app/shared/Models/Entitys';

@Component({
  selector: 'app-camera-index',
  imports: [
    FormsModule, MatCardModule, CommonModule, MatProgressBarModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatMenuModule, MatListModule,
    MatFormFieldModule, MatInputModule, MatSidenavModule, MatTableModule, MatTooltipModule
  ],
  templateUrl: './camera-index.html',
  styleUrl: './camera-index.scss'
})
export class CameraIndex implements OnInit {
  @ViewChild('detailsDrawer') detailsDrawer!: MatDrawer;


  loadingCameras = false;

  cameras: Camera[] = [];
  filteredCameras: Camera[] = [];
  selectedCamera: Camera | null = null;

  showDetails = false;
  private deleting = false;

  private readonly ENDPOINTS = {
    byParking: 'Cameras/by-parking',
    camerasJoin: 'Cameras/join',
    softDelete: 'Cameras',             // DELETE {base}/Cameras/{id}
    hardDelete: 'Cameras/permanent'    // DELETE {base}/Cameras/permanent/{id}
  };

  constructor(
    private _generalService: General,
    private _snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadCameras(); }


  loadCameras(): void {
  this.loadingCameras = true;

  // ✅ Obtén el parkingId desde localStorage
  const parkingId = this._generalService.getParkingId();

  if (!parkingId) {
    this._snack.open('No se encontró el ParkingId en localStorage.', 'Cerrar', { duration: 3000 });
    this.loadingCameras = false;
    return;
  }

  // Llamar al endpoint correcto
  this._generalService.get<Camera[]>('Cameras/join').subscribe({
    next: (items) => {
      const data = items || [];
      this.cameras = data;
      this.filteredCameras = [...data];

      if (this.selectedCamera) {
        const keep = this.cameras.find(c => c.id === this.selectedCamera!.id);
        this.selectedCamera = keep ?? this.cameras[0] ?? null;
      } else {
        this.selectedCamera = this.cameras[0] ?? null;
      }

      this.showDetails = false;
    },
    error: (err: Error) => {
      this._snack.open(err.message || 'No se pudieron cargar las cámaras.', 'Cerrar', { duration: 3500 });
      this.cameras = [];
      this.filteredCameras = [];
      this.selectedCamera = null;
      this.showDetails = false;
    },
    complete: () => this.loadingCameras = false
  });
}

  refresh(): void { this.loadCameras(); }

  applyCameraFilter(value: string): void {
    const t = (value ?? '').toLowerCase().trim();
    this.filteredCameras = !t
      ? this.cameras
      : this.cameras.filter(c =>
          `${c.name ?? ''} ${c.parking ?? ''} ${c.url ?? ''} ${c.resolution ?? ''}`
            .toLowerCase()
            .includes(t)
        );
  }

  clearCameraFilter(): void { this.filteredCameras = this.cameras; }

  quickView(cam: Camera): void { this.selectCamera(cam); this.showDetails = false; }
  selectCamera(cam: Camera): void { this.selectedCamera = cam; }

  openDetails(): void { this.showDetails = !this.showDetails; }

  trackById = (_: number, c: Camera) => c.id;

  addCamera(): void { this.router.navigate(['/cameras-form']); }

  configure(cam: Camera | null): void {
    if (!cam) return;
    if (cam.isDeleted) {
      this._snack.open('No se puede configurar una cámara eliminada.', 'Cerrar', { duration: 2500 });
      return;
    }
    this.router.navigate(['/cameras-form', cam.id]);
  }

  async onDelete(cam: Camera): Promise<void> {
    if (!cam || this.deleting) return;

    const isHard = !!cam.isDeleted;
    const title = isHard ? 'Eliminar definitivamente' : 'Eliminar cámara';
    const text = isHard
      ? 'Esta acción no se puede deshacer. ¿Deseas eliminarla permanentemente?'
      : 'Se marcará como eliminada (borrado lógico). Podrás eliminarla definitivamente después.';
    const confirmText = isHard ? 'Eliminar definitivamente' : 'Eliminar';

    const res = await Swal.fire({
      title, text, icon: 'warning', showCancelButton: true,
      confirmButtonText: confirmText, cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });
    if (!res.isConfirmed) return;

    this.deleting = true;

    if (isHard) {
      // 🔥 Hard delete
      this._generalService.delete(this.ENDPOINTS.hardDelete, cam.id).subscribe({
        next: () => {
          this.cameras = this.cameras.filter(x => x.id !== cam.id);
          this.filteredCameras = this.filteredCameras.filter(x => x.id !== cam.id);
          if (this.selectedCamera?.id === cam.id) this.selectedCamera = this.cameras[0] ?? null;
          Swal.fire({ icon: 'success', title: 'Eliminada definitivamente', timer: 1500, showConfirmButton: false });
        },
        error: (err: Error) => {
          Swal.fire({ icon: 'error', title: 'No se pudo eliminar permanentemente', text: err.message });
        },
        complete: () => { this.deleting = false; }
      });
    } else {
      // 🧹 Soft delete
      this._generalService.delete(this.ENDPOINTS.softDelete, cam.id).subscribe({
        next: () => {
          const a = this.cameras.find(x => x.id === cam.id);        if (a) a.isDeleted = true;
          const b = this.filteredCameras.find(x => x.id === cam.id); if (b) b.isDeleted = true;
          if (this.selectedCamera?.id === cam.id) this.selectedCamera = { ...this.selectedCamera, isDeleted: true };
          Swal.fire({ icon: 'success', title: 'Eliminada (lógico)', timer: 1300, showConfirmButton: false });
        },
        error: (err: Error) => {
          Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: err.message });
        },
        complete: () => { this.deleting = false; }
      });
    }
  }

  async copyUrl(cam: Camera | null) {
    try {
      if (!cam?.url) return;
      await navigator.clipboard.writeText(cam.url);
      this._snack.open('URL copiada al portapapeles', 'OK', { duration: 2000 });
    } catch {
      this._snack.open('No se pudo copiar la URL', 'Cerrar', { duration: 3000 });
    }
  }
}
