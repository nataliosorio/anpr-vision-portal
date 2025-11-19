/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';

import { NotificationHubService } from 'src/app/core/services/notifications/notification-hub.service';
import { General } from 'src/app/core/services/general.service';

interface ParkingNotification {
  id: string;
  data: any;
  timestamp: Date;
  timer?: any;
  isVisible: boolean;
}

@Component({
  selector: 'app-parking-entry',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './parking-entry.html',
  styleUrl: './parking-entry.scss'
})
export class ParkingEntry implements OnInit, OnDestroy {
  realtimeNotifications: ParkingNotification[] = [];
  private notifSub!: Subscription;
  private parkingId: number | null = null;
  private timers: { [key: string]: any } = {};

  constructor(
    private notificationHub: NotificationHubService,
    private general: General
  ) {}

  ngOnInit(): void {
    const storedId = this.general.getParkingId();
    this.parkingId = storedId ? parseInt(storedId, 10) : null;
    if (this.parkingId) {
      // Iniciar conexión websocket
      this.notificationHub.startConnection(this.parkingId);

      // Suscribirse a notificaciones en tiempo real
      this.notifSub = this.notificationHub.notifications$.subscribe((notification) => {
        if (notification) {
          console.log('Nueva notificación en pantalla de entrada:', notification);
          this.addNotification(notification);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }

    // Limpiar todos los timers
    Object.values(this.timers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    this.timers = {};

    this.notificationHub.stopConnection();
  }

  // Agregar nueva notificación con control de duplicados y timer
  private addNotification(notification: any): void {
    const notificationId = this.generateNotificationId(notification);

    // Verificar si ya existe esta notificación
    const existingIndex = this.realtimeNotifications.findIndex(n => n.id === notificationId);
    if (existingIndex !== -1) {
      // Si existe, actualizar timestamp y reiniciar timer
      this.realtimeNotifications[existingIndex].timestamp = new Date();
      this.restartTimer(notificationId);
      return;
    }

    // Crear nueva notificación
    const parkingNotification: ParkingNotification = {
      id: notificationId,
      data: notification,
      timestamp: new Date(),
      isVisible: true
    };

    this.realtimeNotifications.unshift(parkingNotification);

    // Iniciar timer para auto-eliminar en 8 segundos
    this.startTimer(notificationId);

    // Mantener máximo 5 notificaciones visibles para no sobrecargar
    if (this.realtimeNotifications.length > 5) {
      const oldest = this.realtimeNotifications.pop();
      if (oldest && this.timers[oldest.id]) {
        clearTimeout(this.timers[oldest.id]);
        delete this.timers[oldest.id];
      }
    }
  }

  // Generar ID único para la notificación
  private generateNotificationId(notification: any): string {
    // Usar una combinación de campos para crear un ID único
    const timestamp = notification.timestamp || Date.now();
    const content = notification.message || notification.description || notification.id || '';
    return `${timestamp}-${content}`.replace(/\s+/g, '-').toLowerCase();
  }

  // Iniciar timer para auto-eliminar
  private startTimer(notificationId: string): void {
    // Limpiar timer existente si hay
    if (this.timers[notificationId]) {
      clearTimeout(this.timers[notificationId]);
    }

    this.timers[notificationId] = setTimeout(() => {
      this.removeNotification(notificationId);
    }, 8000); // 8 segundos
  }

  // Reiniciar timer
  private restartTimer(notificationId: string): void {
    this.startTimer(notificationId);
  }

  // Remover notificación
  private removeNotification(notificationId: string): void {
    const index = this.realtimeNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.realtimeNotifications.splice(index, 1);
    }

    // Limpiar timer
    if (this.timers[notificationId]) {
      clearTimeout(this.timers[notificationId]);
      delete this.timers[notificationId];
    }
  }

  // Método público para aceptar notificación manualmente
  acceptNotification(notificationId: string): void {
    this.removeNotification(notificationId);
  }

  // Método para extraer información del slot de la notificación
  getSlotInfo(notification: any): { slot: string, sector: string, zona: string } | null {
    // Asumiendo que la notificación contiene información del slot
    // Ajustar según la estructura real de las notificaciones
    if (notification.slotName && notification.sectorName && notification.zoneName) {
      return {
        slot: notification.slotName,
        sector: notification.sectorName,
        zona: notification.zoneName
      };
    }
    return null;
  }

  // Método para determinar el tipo de notificación
  getNotificationType(notification: any): string {
    // Lógica para determinar si es entrada, salida, etc.
    if (notification.type === 'ENTRY' || notification.message?.includes('entrada')) {
      return 'entrada';
    } else if (notification.type === 'EXIT' || notification.message?.includes('salida')) {
      return 'salida';
    }
    return 'info';
  }

  // Método para obtener el color según el tipo
  getNotificationColor(type: string): string {
    switch (type) {
      case 'entrada': return '#2ed8b6'; // Color de éxito del sistema
      case 'salida': return '#ff5370'; // Color de peligro del sistema
      default: return '#4099ff'; // Color primario del sistema
    }
  }

  // Método para obtener el ícono según el tipo
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'entrada': return 'login';
      case 'salida': return 'logout';
      default: return 'info';
    }
  }

  // Limpiar todas las notificaciones
  clearNotifications(): void {
    // Limpiar timers
    Object.values(this.timers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    this.timers = {};
    this.realtimeNotifications = [];
  }

  // Método para trackBy en ngFor
  trackByNotification(index: number, item: ParkingNotification): any {
    return item.id;
  }
}