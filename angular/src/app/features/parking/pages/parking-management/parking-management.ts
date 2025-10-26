/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';
import { Sectors } from 'src/app/features/parameters/pages/sectors/sectors';
import { Slots } from 'src/app/features/parameters/pages/slots/slots';
import { Zones } from 'src/app/features/parameters/pages/zones/zones';

@Component({
  selector: 'app-parking-management',
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatInputModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './parking-management.html',
  styleUrl: './parking-management.scss'
})
export class ParkingManagement implements OnInit {
  zones: Zones[] = [];
  sectors: Sectors[] = [];
  slots: Slots[] = [];
  vehicleData: any = null;

  selectedZone: Zones | null = null;
  filteredSectors: Sectors[] = [];
  selectedSector: Sectors | null = null;
  filteredSlots: Slots[] = [];

  selectedSlot: Slots | null = null;
  showSectorModal = false;

  // usar setter para filtrar sin cambiar el HTML
  private _searchTerm = '';
  get searchTerm(): string { return this._searchTerm; }
  set searchTerm(v: string) {
    this._searchTerm = (v ?? '').toString();
    this.filterSectors();
    if (this.selectedSector) this.filterSlots();
  }

  constructor(private _generalService: General) {}

  ngOnInit() {
    this.getAllZones();
    this.getAllSectors();
    this.getAllSlots();
  }

  // --- ZONES ---
  getAllZones(): void {
    const parkingId = this._generalService.getParkingId();
    if (!parkingId) {
      Swal.fire('Error', 'No se encontró el ParkingId en localStorage.', 'error');
      this.zones = [];
      return;
    }

    this._generalService.get<Zones[]>('Zones/join').subscribe({
      next: (zones) => {
        this.zones = zones ?? [];
        if (this.zones.length > 0) this.selectZone(this.zones[0]);
      },
      error: (err) => console.error('Error al obtener zonas:', err)
    });
  }

  // --- SECTORS ---
  getAllSectors(): void {
    this._generalService.get<Sectors[]>('Sectors/join').subscribe({
      next: (sectors) => {
        this.sectors = sectors ?? [];
        this.filterSectors();
      },
      error: (err) => console.error('Error al obtener sectores:', err)
    });
  }

  // --- SLOTS ---
  getAllSlots(): void {
    this._generalService.get<Slots[]>('Slots/join').subscribe({
      next: (slots) => {
        this.slots = slots ?? [];
        this.filterSlots();
      },
      error: (err) => console.error('Error al obtener slots:', err)
    });
  }

  // --- FILTROS ---
  selectZone(zone: Zones): void {
    this.selectedZone = zone;
    this.filterSectors();
    this.selectedSector = null;
    this.filteredSlots = [];
  }

  filterSectors(): void {
    if (!this.selectedZone) { this.filteredSectors = []; return; }

    const t = this._searchTerm.toLowerCase().trim();
    const base = this.sectors.filter(s => s.zonesId === this.selectedZone!.id);

    this.filteredSectors = !t ? base : base.filter(s =>
      (s.name ?? '').toLowerCase().includes(t) ||
      String(s.capacity ?? '').toLowerCase().includes(t) ||
      (s.typeVehicle ?? '').toLowerCase().includes(t)
    );
  }

  openSectorModal(sector: Sectors): void {
    this.selectedSector = sector;
    this.filterSlots();
    this.showSectorModal = true;
    this.selectedSlot = null;
  }

  closeSectorModal(): void {
    this.showSectorModal = false;
    this.selectedSector = null;
    this.filteredSlots = [];
    this.selectedSlot = null;
  }

  filterSlots(): void {
    if (!this.selectedSector) { this.filteredSlots = []; return; }

    const t = this._searchTerm.toLowerCase().trim();
    const base = this.slots.filter(s => s.sectorsId === this.selectedSector!.id);

    this.filteredSlots = !t ? base : base.filter(s =>
      (s.name ?? '').toLowerCase().includes(t)
    );
  }

  // --- SLOT SELECCIÓN ---
  selectSlot(slot: any): void {
    this.selectedSlot = slot;
    this.vehicleData = null;

    if (!slot.isAvailable) {
      this.loadVehicleData(slot.id);
    }
  }

  // Consulta al backend para traer la info del vehículo en el slot
  loadVehicleData(slotId: number): void {
  this._generalService.get<any>(`Vehicle/slot/${slotId}`).subscribe({
    next: (response) => {
      this.vehicleData = response;

      if (this.vehicleData?.vehicleId) {
        // Primero traigo el vehículo
        this._generalService.get<any>(`Vehicle/${this.vehicleData.vehicleId}`).subscribe({
          next: (vehicle) => {
            this.vehicleData.vehicle = vehicle;

            // Ahora si existe clientId, hago la consulta del cliente
            if (vehicle?.clientId) {
              this._generalService.get<any>(`Client/${vehicle.clientId}`).subscribe({
                next: (client) => {
                  this.vehicleData.vehicle.client = client;
                  console.log("Cliente cargado:", client);
                },
                error: (err) => console.error('Error cargando datos del cliente', err)
              });
            }
          },
          error: (err) => console.error('Error cargando datos del vehículo', err)
        });
      }
    },
    error: (err) => console.error('Error cargando info de slot', err)
  });
}


  // --- UTILIDADES ---
  getStatusColor(status: string): string {
    switch (status) {
      case 'libre': return '#10B981';
      case 'ocupado': return '#EF4444';
      case 'reservado': return '#F59E0B';
      case 'mantenimiento': return '#6B7280';
      default: return '#6B7280';
    }
  }

  getSectorStatusCount(status: string, sector: Sectors): number {
    const slotsSector = this.slots.filter(s => s.sectorsId === sector.id);
    return slotsSector.filter((slot: any) => {
      if (status === 'libre') return slot.isAvailable;
      if (status === 'ocupado') return !slot.isAvailable;
      return false;
    }).length;
  }

  getAvailableSlots(sector: Sectors): number {
    return this.slots.filter(s => s.sectorsId === sector.id && s.isAvailable).length;
  }

  getTotalSectorSlots(sector: Sectors): number {
    return this.slots.filter(s => s.sectorsId === sector.id).length;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      libre: 'Disponible',
      ocupado: 'Ocupado',
      reservado: 'Reservado',
      mantenimiento: 'En Mantenimiento'
    };
    return map[status] ?? status;
  }
}
