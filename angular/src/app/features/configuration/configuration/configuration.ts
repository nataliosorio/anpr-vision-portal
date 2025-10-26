/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy, inject, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { General } from 'src/app/core/services/general.service';
import { User, Person } from 'src/app/shared/Models/Entitys';
import { EditPersonDialogComponent } from '../../segurity/pages/profile/edit-person-dialog-component/edit-person-dialog-component';
import { EditUserDialogComponent } from '../../segurity/pages/profile/edit-user-dialog-component/edit-user-dialog-component';



// Ajusta rutas si tus diálogos están en otra carpeta


@Component({
  selector: 'app-configuration',
  imports: [CommonModule, FormsModule, MatDialogModule, EditUserDialogComponent, EditPersonDialogComponent],
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.scss']
})
export class Configuration implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private service = inject(General);
  private dialog = inject(MatDialog);

  // modelos tipados según tu genérico
  userData: User | null = null;
  personData: Person | null = null;

  // Nuevo: username obtenido desde General
  userName: string | null = null;

  // estado UI
  loading = false;
  // --- NUEVO: indicador de carga específica de la categoría ---
parkingCategoryLoading = false;

  errorMessage = '';

  // estado para mostrar/ocultar sidebar
  showSidebar = false;

  userProfile = {
    name: 'Usuario',
  };

  // placeholders
  userCourses: any[] = [];
  paymentInfo = { lastFourDigits: 'XXXX' };

  // --- NUEVO: parking (solo los campos que devuelve tu back) ---
  parkingData: {
    location?: string | null;
    parkingCategoryId?: number | null;
    parkingCategory?: any | null;
    name?: string | null;
    id?: number | null;
    asset?: boolean | null;
    isDeleted?: boolean | null;
  } | null = null;
  parkingLoading = false;
  parkingError = '';

  // userId desde localStorage via General
  private userIdStr: string | null = null;
  private userid = 0;

  // TrackBy para ngFor de cursos
  trackByCourse: TrackByFunction<any> = (_index: number, item: any) => item?.id ?? _index;

  constructor() {}

  ngOnInit(): void {
    this.userName = this.service.getUsername?.() ?? null;
    this.userIdStr = this.service.getUserId?.() ?? null;
    this.userid = Number(this.userIdStr ?? 0);

    this.initPlaceholders();

    if (this.userid && !isNaN(this.userid) && this.userid > 0) {
      this.loadUser(this.userid);
    } else {
      this.errorMessage = 'Usuario no autenticado';
      console.warn('No userId disponible en General.getUserId()');
    }

    // Cargamos el parqueadero con id "quemado" = 3
    this.loadParking(3);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initPlaceholders(): void {
    this.userCourses = [
      { id: 1, title: 'Configuracion del parqueadero', description: 'Descripción', lessonCount: 10, status: 'Начат', isCompleted: false, isCurrent: true, startDate: null },
      { id: 1, title: 'Cámaras en el parqueadero', description: 'Descripción', lessonCount: 10, status: 'Начат', isCompleted: false, isCurrent: true, startDate: null },
    ];
    this.paymentInfo = { lastFourDigits: '2065' };
  }

  /** Carga User y luego Person si existe personId */
  loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getById<User>('User', id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.loading = false;
          this.errorMessage = `No se pudo cargar el usuario: ${err?.message ?? err}`;
          console.error('Error get User', err);
          return of(null);
        })
      )
      .subscribe((user) => {
        this.loading = false;
        if (!user) return;
        this.userData = user;
        this.applyToProfile();

        const pid = (user as any)?.personId;
        if (pid) {
          this.loadPerson(Number(pid));
        }
      });
  }

  loadPerson(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getById<Person>('Person', id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.loading = false;
          this.errorMessage = `No se pudo cargar la persona: ${err?.message ?? err}`;
          console.error('Error get Person', err);
          return of(null);
        })
      )
      .subscribe((person) => {
        this.loading = false;
        if (!person) return;
        this.personData = person;
        this.applyToProfile();
      });
  }

  private applyToProfile(): void {
    const u = this.userData ?? ({} as User);
    const p = this.personData ?? ({} as Person);

    const fullNamePerson = (p.firstName || p.lastName) ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : '';
    const name = fullNamePerson || (u as any).personName || (u as any).userName || this.userName || 'Usuario';

    this.userProfile = {
      name,
    };
  }

  get firstLetter(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '';
  }

  // ---------------- acciones UI (sin tocar la lógica original) ----------------
  openEditUserDialog(): void {
    try {
      const ref = this.dialog.open(EditUserDialogComponent, { width: '420px',panelClass: 'custom-edit-dialog', data: { ...(this.userData ?? {}) }});
      ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res === 'updated') this.reload();
      });
    } catch (err) {
      console.warn('EditUserDialogComponent no disponible o error al abrir diálogo', err);
    }
  }

  openEditPersonDialog(): void {
    try {
      const ref = this.dialog.open(EditPersonDialogComponent, { width: '420px',panelClass: 'custom-edit-dialog', data: { ...(this.personData ?? {}) }});
      ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res === 'updated') this.reload();
      });
    } catch (err) {
      console.warn('EditPersonDialogComponent no disponible o error al abrir diálogo', err);
    }
  }

  reload(): void {
    if (this.userid) this.loadUser(this.userid);
  }

  /**
   * Abre la sidebar (muestra la columna derecha).
   * Prevents default si viene de un <a>.
   */
  openParkInfo(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showSidebar = true;

    // opcional: desplazarse suavemente para que el usuario vea la sidebar
    setTimeout(() => {
      const container = document.querySelector('.profile-container');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // y opcionalmente enfocar la sidebar
      const sidebar = document.querySelector('.sidebar-section');
      (sidebar as HTMLElement | null)?.focus();
    }, 80);
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  // ------------------ NUEVO: Cargar información del parqueadero por ID (quemado = 3) ------------------
// ------------------ Cargar información del parqueadero por ID (quemado = 3) ------------------
loadParking(id: number): void {
  this.parkingLoading = true;
  this.parkingError = '';

  this.service.getById<any>('Parking', id)
    .pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.parkingLoading = false;
        this.parkingError = `No se pudo cargar el parqueadero: ${err?.message ?? err}`;
        console.error('Error get Parking', err);
        return of(null);
      })
    )
    .subscribe((resp) => {
      // termina estado de loading principal (pero si vamos a cargar categoría, lo manejamos abajo)
      if (!resp) {
        this.parkingLoading = false;
        this.parkingData = null;
        return;
      }

      // Soporta wrapper { data: {...} } o la entidad directa
      const payload = (resp && (resp as any).data) ? (resp as any).data : resp;

      // Mapeamos **solo** los campos que tu back devuelve
      this.parkingData = {
        location: payload?.location ?? null,
        parkingCategoryId: payload?.parkingCategoryId ?? null,
        parkingCategory: payload?.parkingCategory ?? null,
        name: payload?.name ?? null,
        id: payload?.id ?? null,
        asset: payload?.asset ?? null,
        isDeleted: payload?.isDeleted ?? null
      };

      // Si recibimos parkingCategoryId y no hay objeto de parkingCategory, traemos la categoría por separado
      const catId = this.parkingData.parkingCategoryId;
      if (catId && (this.parkingData.parkingCategory === null || this.parkingData.parkingCategory === undefined)) {
        this.parkingCategoryLoading = true;

        // Asumo que la entidad se llama 'ParkingCategory' — si en tu API tiene otro nombre, cámbialo
        this.service.getById<any>('ParkingCategory', Number(catId))
          .pipe(
            takeUntil(this.destroy$),
            catchError(errCat => {
              // no bloqueamos la UI completa si falla la categoría; informamos y dejamos el campo null
              this.parkingCategoryLoading = false;
              console.warn(`No se pudo cargar ParkingCategory ${catId}:`, errCat);
              return of(null);
            })
          )
          .subscribe((catResp) => {
            this.parkingCategoryLoading = false;
            if (!catResp) return;

            const catPayload = (catResp && (catResp as any).data) ? (catResp as any).data : catResp;

            // Si la respuesta tiene nombre, lo dejamos como objeto completo para acceder a .name en template
            this.parkingData = {
              ...this.parkingData,
              parkingCategory: catPayload ?? this.parkingData?.parkingCategory
            };
          }, () => {
            // por seguridad: asegurar que la bandera se apaga ante error no capturado
            this.parkingCategoryLoading = false;
          }, () => {
            // noop
          });

        // dejamos el loading principal en false porque ya terminó la carga del parking (categoria se carga por separado)
        this.parkingLoading = false;
      } else {
        // no hay catId o ya viene la categoría embebida: terminamos
        this.parkingCategoryLoading = false;
        this.parkingLoading = false;
      }
    });
}

}
