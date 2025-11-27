/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  private isHandlingSession = false;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // Solo manejamos errores HTTP
        if (err instanceof HttpErrorResponse) {
          // 🔹 Caso 1: token inválido / expirado → 401
          if (err.status === 401) {
            // TEMPORAL: Mostrar alerta para todos los 401 para debug
            console.log('🔴 AuthErrorInterceptor: 401 detectado', err.url);

            // Solo manejar como sesión caducada si hay token en localStorage
            // Si no hay token, es login fallido y debe manejarlo el componente
            const hasToken = !!localStorage.getItem('authToken');
            console.log('🔴 AuthErrorInterceptor: hasToken =', hasToken);

            if (hasToken) {
              console.log('🔴 AuthErrorInterceptor: Mostrando alerta de sesión caducada');
              // Evitar múltiples alerts si hay muchas peticiones fallando a la vez
              if (!this.isHandlingSession) {
                this.isHandlingSession = true;

                // Limpiar sesión
                localStorage.clear();

                Swal.fire({
                  icon: 'info',
                  title: 'Sesión caducada',
                  text: 'Tu sesión ha caducado, por favor vuelve a iniciar sesión.',
                  confirmButtonText: 'Aceptar',
                }).then(() => {
                  this.isHandlingSession = false;
                  this.router.navigate(['/login']); // o '/' según tu ruta
                });
              }

              // No propagamos el error para evitar que el componente también lo maneje
              return EMPTY;
            } else {
              console.log('🔴 AuthErrorInterceptor: Sin token, dejando que componente maneje');
              // No hay token, es login fallido, dejar que el componente maneje el error
              return throwError(() => err);
            }
          }

          // 🔹 Caso 2: autenticado pero sin permisos → 403
          if (err.status === 403) {
            // Aquí NO limpiamos sesión, solo mostramos mensaje de acceso denegado
            const msgFromApi =
              (err.error && (err.error.message || err.error.title)) ||
              'No tienes permisos para realizar esta acción.';

            Swal.fire({
              icon: 'warning',
              title: 'Acceso denegado',
              text: msgFromApi,
            });

            // No propagamos el error para evitar que el componente también lo maneje
            return EMPTY;
          }
        }

        // Otros errores → los manejas como siempre
        return throwError(() => err);
      })
    );
  }
}
