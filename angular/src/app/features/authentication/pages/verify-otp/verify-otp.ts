/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular imports
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Project imports
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApiResponse } from 'src/app/shared/Models/ApiResponse';
import { AuthData } from '../../models/AuthData';
import { VerificationRequestDto } from '../../models/verificationRequestDto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.scss'],
})
export class VerifyOtpComponent implements OnInit {
  userId!: number;
  username!: string;
  password!: string;

  otpForm!: FormGroup;
  otpIdx = [0, 1, 2, 3, 4, 5];
  loading = false;

  private fb = inject(FormBuilder);
  private service = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ngOnInit(): void {
  //   // Inicializar formulario OTP
  //   this.otpForm = this.fb.group({
  //     '0': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //     '1': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //     '2': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //     '3': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //     '4': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //     '5': ['', [Validators.required, Validators.pattern('[0-9]')]],
  //   });

  //   // Obtener parámetros de la URL
  //   this.route.queryParams.subscribe(params => {
  //     this.userId = +params['userId'];
  //     this.username = params['username'];
  //     this.password = params['password'];

  //     if (!this.userId || !this.username) {
  //       Swal.fire('Error', 'Datos de usuario no válidos. Vuelve a iniciar sesión.', 'error');
  //       this.router.navigate(['/login']);
  //     }
  //   });
  // }

  ngOnInit(): void {
  // Intentar leer desde state (más seguro que queryParams)
  const navState = history.state;

  this.userId = navState.userId;
  this.username = navState.username;
  this.password = navState.password;

  if (!this.userId || !this.username) {
    Swal.fire('Error', 'Datos de usuario no válidos. Vuelve a iniciar sesión.', 'error');
    this.router.navigate(['/login']);
  }

  // Inicializar formulario OTP
  this.otpForm = this.fb.group({
    '0': ['', [Validators.required, Validators.pattern('[0-9]')]],
    '1': ['', [Validators.required, Validators.pattern('[0-9]')]],
    '2': ['', [Validators.required, Validators.pattern('[0-9]')]],
    '3': ['', [Validators.required, Validators.pattern('[0-9]')]],
    '4': ['', [Validators.required, Validators.pattern('[0-9]')]],
    '5': ['', [Validators.required, Validators.pattern('[0-9]')]],
  });
}


  /**
    * Verifica código OTP y completa login
    */
  verifyOtp() {
    if (this.otpForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Código inválido',
        text: 'Por favor, ingresa el código de 6 dígitos.',
      });
      return;
    }

    this.loading = true;

    const otpCode = Object.values(this.otpForm.value).join('');
    const dto: VerificationRequestDto = {
      userId: this.userId,
      code: otpCode,
    };

    this.service.verifyOtp(dto).subscribe({
      next: (resp) => {
        let data: AuthData | null = null;
        try {
          data = this.unwrapData(resp);
        } catch (e: any) {
          throw new Error(e?.message || 'Error de verificación.');
        }

        if (!data?.token) {
          throw new Error('Respuesta inválida del servidor (sin token).');
        }

        // Guardar sesión en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', this.username);
        localStorage.setItem('userId', JSON.stringify(data.userId));
        localStorage.setItem('personId', JSON.stringify(data.personId));
        localStorage.setItem('rolesByParking', JSON.stringify(data.rolesByParking));

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Has iniciado sesión correctamente',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/select-parking']);
        });
      },
      error: (err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de verificación',
          text: err?.message ?? 'Código incorrecto o expirado.',
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
    * Extrae el objeto AuthData independientemente si viene envuelto en ApiResponse
    */
  private unwrapData(resp: AuthData | ApiResponse<AuthData>): AuthData | null {
    const isWrapped = (resp as ApiResponse<AuthData>)?.data !== undefined;
    if (isWrapped) {
      const w = resp as ApiResponse<AuthData>;
      if (!w.success) throw new Error(w.message || 'Error en verificación.');
      return w.data ?? null;
    }
    return resp as AuthData;
  }

  /**
    * Maneja el input en las cajitas OTP
    */
  onOtpInput(index: number, event: any) {
    const input = event.target;
    const value = input.value;

    if (value && !/^\d$/.test(value)) {
      input.value = '';
      return;
    }

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[id="otp-${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  /**
    * Maneja el keydown en las cajitas OTP
    */
  onOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpForm.get(index.toString())?.value && index > 0) {
      const prevInput = document.querySelector(`input[id="otp-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  /**
    * Maneja el paste en las cajitas OTP
    */
  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text');
    if (paste && /^\d{6}$/.test(paste)) {
      for (let i = 0; i < 6; i++) {
        this.otpForm.get(i.toString())?.setValue(paste[i]);
      }
    }
  }

  /**
    * Volver al login
    */
  backToLogin() {
    this.router.navigate(['/login']);
  }
}
