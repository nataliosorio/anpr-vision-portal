/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';
import { LoginDto } from '../../models/loginDto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  LoginDto: LoginDto = {
    username: '',
    password: '',
  };

  showPassword = false;
  loading = false;
  tempUserId: number | null = null;

  private service = inject(AuthService);
  private router = inject(Router);

  /**
   * Paso 1: Valida credenciales y solicita código OTP
   */
  login(): void {
    if (!this.LoginDto.username || !this.LoginDto.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa tu usuario y contraseña.',
      });
      return;
    }

    this.loading = true;

    this.service.login(this.LoginDto).subscribe({
      next: (resp: ApiResponse<{ userId: number }>) => {
        console.log('✅ Respuesta del login:', resp);

        if (resp?.success !== true) {
          Swal.fire('Error', resp?.message || 'Error de autenticación.', 'error');
          return;
        }

        this.tempUserId = resp.data?.userId;
        console.log('🧩 UserId recibido:', this.tempUserId);

      //   Swal.fire({
      //     icon: 'info',
      //     title: 'Código enviado',
      //     text: resp.message || 'Se envió un código de verificación a tu correo.',
      //     timer: 2500,
      //     showConfirmButton: false,
      //   }).then(() => {
      //     this.router.navigate(['/verify-otp'], {
      //       queryParams: {
      //         userId: this.tempUserId,
      //         username: this.LoginDto.username,
      //         password: this.LoginDto.password,
      //       },
      //     });
      //   });
      // },
      Swal.fire({
  icon: 'info',
  title: 'Código enviado',
  text: resp.message || 'Se envió un código de verificación a tu correo.',
  timer: 2500,
  showConfirmButton: false,
}).then(() => {
  this.router.navigate(['/verify-otp'], {
    state: {
      userId: this.tempUserId,
      username: this.LoginDto.username,
      password: this.LoginDto.password,
    },
  });
});
      },
      error: (err: Error) => {
        console.error('❌ Error en login:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: err?.message ?? 'Credenciales incorrectas o servidor no disponible.',
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Navega a la pantalla de recuperación de contraseña
   */
  restablecerContrasena(): void {
    this.router.navigate(['/reset-password']);
  }
}
