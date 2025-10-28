/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { General } from 'src/app/core/services/general.service';
import { Subscription } from 'rxjs';
import { NotificationHubService } from 'src/app/core/services/notifications/notification-hub.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class NavRightComponent implements OnInit, OnDestroy {
  visibleUserList = false;
  chatMessage = false;
  friendId!: number;
  userName: string | null = null;
  parkingId: number | null = null; // ✅ Cambiado a number

  @ViewChild('notifDropdown') notifDropdown!: NgbDropdown;

  // 🔸 Notificaciones en tiempo real
  notifications: any[] = [];
  private notifSub!: Subscription;

  // Inyectamos servicios
  private service = inject(General);
  private route = inject(Router);
  private notifHub = inject(NotificationHubService);

  ngOnInit(): void {
    this.userName = this.service.getUsername();

    // 🔹 Obtener y convertir el parkingId
    const storedId = this.service.getParkingId();
    this.parkingId = storedId ? parseInt(storedId, 10) : null;

    if (this.parkingId && !isNaN(this.parkingId)) {
      // ✅ Conexión al Hub usando el ID numérico
      this.notifHub.startConnection(this.parkingId);

      // Suscribirse a las notificaciones en tiempo real
      this.notifSub = this.notifHub.notifications$.subscribe((list) => {
        this.notifications = list;
      });
    } else {
      console.warn('⚠️ No se encontró un parkingId válido para iniciar SignalR.');
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
    this.notifHub.stopConnection();
  }

  // =====================
  // Métodos de UI
  // =====================
  cerrarSesion() {
    this.closeNotifPanel();
    localStorage.clear();
    this.route.navigate(['/login']);
  }

  configuracion() {
    this.closeNotifPanel();
    this.route.navigate(['/configuracion']);
  }

  get firstLetter(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '';
  }

  openNotifPanel() {
    if (this.notifDropdown && !this.notifDropdown.isOpen()) {
      this.notifDropdown.open();
    }
  }

  closeNotifPanel() {
    if (this.notifDropdown && this.notifDropdown.isOpen()) {
      this.notifDropdown.close();
    }
  }

  toggleNotifPanel() {
    if (this.notifDropdown) {
      this.notifDropdown.toggle();
    }
  }

  markAllRead() {
    this.closeNotifPanel();
  }

  clearAll() {
    this.notifications = [];
    this.closeNotifPanel();
  }

  viewAll() {
    this.closeNotifPanel();
    this.route.navigate(['/notifications']);
  }

}
