/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { General } from '../../services/general.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private general = inject(General);

  getByParking(): Observable<any[]> {
    // El helper de General ya agrega el parkingId automáticamente
    return this.general.get<any[]>('notification/by-parking');
  }
}
