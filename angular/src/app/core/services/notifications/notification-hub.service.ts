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
  private notificationsSubject = new BehaviorSubject<any>(null);
  notifications$ = this.notificationsSubject.asObservable();
  private connectionCount = 0;
  private currentParkingId: number | null = null;

  startConnection(parkingId: number): void {
    // Si ya hay una conexión activa para el mismo parkingId, solo incrementar el contador
    if (this.hubConnection && this.currentParkingId === parkingId) {
      this.connectionCount++;
      console.log(`🔄 Conexión ya existe para parkingId ${parkingId}, contador: ${this.connectionCount}`);
      return;
    }

    // Si hay una conexión para un parkingId diferente, cerrarla primero
    if (this.hubConnection && this.currentParkingId !== parkingId) {
      console.log(`🔄 Cambiando conexión de parkingId ${this.currentParkingId} a ${parkingId}`);
      this.stopConnection();
    }

    this.connectionCount = 1;
    this.currentParkingId = parkingId;

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
      .then(() => console.log(`✅ Conectado al ParkingHub para parkingId ${parkingId}`))
      .catch(err => console.error('❌ Error al conectar con SignalR:', err));

    // Suscribirse a las notificaciones
    this.hubConnection.on('ReceiveNotification', (notification) => {
      console.log('📩 Notificación recibida:', notification);

      // Emitir la nueva notificación
      this.notificationsSubject.next(notification);
    });
  }

  stopConnection(): void {
    if (this.connectionCount > 0) {
      this.connectionCount--;
      console.log(`🔄 Decrementando contador de conexiones: ${this.connectionCount}`);
    }

    // Solo cerrar la conexión cuando no hay más componentes usando el servicio
    if (this.connectionCount === 0 && this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('🧩 Conexión cerrada');
        this.currentParkingId = null;
      });
    }
  }
}
