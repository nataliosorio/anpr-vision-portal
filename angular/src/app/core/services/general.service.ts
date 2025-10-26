/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';



@Injectable({ providedIn: 'root' })
export class General {
  private http = inject(HttpClient);
  private baseUrl = environment.apiURL;

  constructor() {}

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getPersonId(): string | null {
    return localStorage.getItem('personId');
  }

  getParkingId(): string | null {
    return localStorage.getItem('parkingId');
  }

  // ---------- Helpers ----------
  private extractDataOrThrow<T>(res: any): T {
    // Si el back envuelve como ApiResponse<T>
    if (res && typeof res === 'object' && 'success' in res) {
      if (res.success === false) {
        // Propaga el mensaje del back
        throw new Error(res.message || 'Operación inválida');
      }
      return (res.data as T);
    }
    // Si el back devuelve T directo (sin ApiResponse)
    return res as T;
  }

  private pickErrorMessage(err: any): string {
    // HttpErrorResponse
    const httpErr = err as HttpErrorResponse;

    // Payload del backend
    const payload = httpErr?.error;

    // Caso: backend envía string plano
    if (typeof payload === 'string' && payload.trim().length) return payload;

    // Caso: backend envía ApiResponse con success:false
    if (payload && typeof payload === 'object') {
      if ('message' in payload && payload.message) return payload.message;
      // ProblemDetails (ASP.NET)
      if ('title' in payload && payload.title) return payload.title as string;
      // ModelState errors (ASP.NET)
      if ('errors' in payload && payload.errors) {
        const firstKey = Object.keys(payload.errors)[0];
        const firstMsg = payload.errors[firstKey]?.[0];
        if (firstMsg) return firstMsg;
      }
    }

    // Fallbacks
    if (httpErr?.message) return httpErr.message;
    if (err?.message) return err.message;

    return 'Ocurrió un error inesperado.';
  }

  private handle<T>(): (source: Observable<any>) => Observable<T> {
    return (source) =>
      source.pipe(
        map((res) => this.extractDataOrThrow<T>(res)),
        catchError((err) => throwError(() => new Error(this.pickErrorMessage(err))))
      );
  }

  // ---------- Métodos públicos ----------
//   get<T>(endpoint: string, params?: HttpParams): Observable<T> {
//     return this.http
//       .get(`${this.baseUrl}/${endpoint}`, { params })
//       .pipe(this.handle<T>());
//   }

//   getById<T>(endpoint: string, id: number | string): Observable<T> {
//     return this.http
//       .get(`${this.baseUrl}/${endpoint}/${id}`)
//       .pipe(this.handle<T>());
//   }

//   getByParking<T>(endpoint: string): Observable<T> {
//   const parkingId = this.getParkingId();

//   if (!parkingId) {
//     throw new Error('No se encontró el parkingId en el almacenamiento local.');
//   }

//   const url = `${this.baseUrl}/${endpoint}/by-parking/${parkingId}`;
//   return this.http.get(url).pipe(this.handle<T>());
// }

//   post<T>(endpoint: string, body: unknown): Observable<T> {
//     return this.http
//       .post(`${this.baseUrl}/${endpoint}`, body)
//       .pipe(this.handle<T>());
//   }

//   put<T>(endpoint: string, body: unknown): Observable<T> {
//     return this.http
//       .put(`${this.baseUrl}/${endpoint}`, body)
//       .pipe(this.handle<T>());
//   }

//   delete<T>(endpoint: string, id: number | string): Observable<T> {
//     return this.http
//       .delete(`${this.baseUrl}/${endpoint}/${id}`)
//       .pipe(this.handle<T>());
//   }

// ---------- Métodos públicos ----------
get<T>(endpoint: string, params?: HttpParams): Observable<T> {
  const url = this.buildUrlWithParking(endpoint);
  return this.http.get(url, { params }).pipe(this.handle<T>());
}
  getById<T>(endpoint: string, id: number | string): Observable<T> {
    const url = this.buildUrlWithParking(`${endpoint}/${id}`);
    return this.http.get(url).pipe(this.handle<T>());
  }
post<T>(endpoint: string, body: unknown, options?: any): Observable<T> {
  const url = this.buildUrlWithParking(endpoint);
  return this.http.post<T>(url, body, options).pipe(this.handle<T>());
}


put<T>(endpoint: string, body: unknown): Observable<T> {
  const url = this.buildUrlWithParking(endpoint);
  return this.http.put(url, body).pipe(this.handle<T>());
}

delete<T>(endpoint: string, id: number | string): Observable<T> {
  const url = this.buildUrlWithParking(`${endpoint}/${id}`);
  return this.http.delete(url).pipe(this.handle<T>());
}

/**
 * 🔹 Agrega dinámicamente el parkingId si el endpoint lo requiere.
 * - Si el endpoint ya contiene /by-parking o ?parkingId=, no hace nada.
 * - Si hay un parkingId en localStorage, lo agrega automáticamente.
 */
private buildUrlWithParking(endpoint: string): string {
  const base = `${this.baseUrl}/${endpoint}`;
  const parkingId = this.getParkingId();

  if (!parkingId) return base;

  const hasParkingAlready =
    base.includes('by-parking') || base.includes('parkingId=');

  if (hasParkingAlready) return base;

  // Si no tiene, lo agrega como query param
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}parkingId=${parkingId}`;
}
}
