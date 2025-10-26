/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../generic/Models/Entitys';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api/notification';
  // 👆 ajusta con tu baseUrl real del backend

  constructor(private http: HttpClient) {}

  // 🔹 Obtener notificaciones de un parking
  getByParking(parkingId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/by-parking/${parkingId}`);
  }

  // 🔹 Marcar como leída
  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  // 🔹 Crear notificación manualmente (para pruebas)
  create(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/create`, notification);
  }
}
