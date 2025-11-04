/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {
  private hubConnection!: signalR.HubConnection;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private currentNotifications: any[] = [];

  startConnection(parkingId: number): void {
    const hubUrl = `${environment.apiHub}?parkingId=${parkingId}`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Conectado al ParkingHub'))
      .catch(err => console.error('❌ Error al conectar con SignalR:', err));

    // Suscribirse a las notificaciones
    this.hubConnection.on('ReceiveNotification', (notification) => {
      console.log('📩 Notificación recibida:', notification);

      // Añadir a la lista local
      this.currentNotifications.unshift(notification);
      this.notificationsSubject.next(this.currentNotifications);
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🧩 Conexión cerrada'));
    }
  }
}
