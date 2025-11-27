/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { General } from '../../services/general.service';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private general = inject(General);
  private baseUrl = environment.apiURL;

  getByParking(onlyUnread: boolean = false): Observable<any[]> {
    const parkingId = this.general.getParkingId();
    if (!parkingId) {
      throw new Error('No se encontró parkingId');
    }
    const url = `${this.baseUrl}/notification/by-parking/${parkingId}?onlyUnread=${onlyUnread}`;
    return this.http.get<any>(url).pipe(
      // Usar el handle del general para extraer data
      this.general['handle']<any[]>()
    );
  }

  markAsRead(id: number): Observable<any> {
    const url = `${this.baseUrl}/notification/${id}/read`;
    return this.http.put(url, {}).pipe(
      this.general['handle']<any>()
    );
  }

  markAllAsRead(parkingId: number): Observable<any> {
    const url = `${this.baseUrl}/notification/by-parking/${parkingId}/read-all`;
    return this.http.put(url, {}).pipe(
      this.general['handle']<any>()
    );
  }

  delete(id: number): Observable<any> {
    // Asumiendo que hay DELETE /api/notification/{id}
    const url = `${this.baseUrl}/notification/${id}`;
    return this.http.delete(url).pipe(
      this.general['handle']<any>()
    );
  }

  permanentDelete(id: number): Observable<any> {
    const url = `${this.baseUrl}/notification/permanent/${id}`;
    return this.http.delete(url).pipe(
      this.general['handle']<any>()
    );
  }
}
