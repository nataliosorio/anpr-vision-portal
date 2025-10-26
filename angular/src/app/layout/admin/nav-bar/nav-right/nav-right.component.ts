/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// ng-bootstrap
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project imports
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent implements OnInit {
  visibleUserList: boolean;
  chatMessage: boolean;
  friendId!: number;

  @ViewChild('notifDropdown') notifDropdown!: NgbDropdown;

  private service = inject(General);
  private route = inject(Router);

  userName: string | null = null;

  constructor() {
    this.visibleUserList = false;
    this.chatMessage = false;
  }

  ngOnInit(): void {
    this.userName = this.service.getUsername();
  }

  // --- Métodos de chat ---
  onChatToggle(friendID: any) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }

  cerrarSesion() {
    this.closeNotifPanel();
    localStorage.clear();
    this.route.navigate(['/login']);
  }

  viewProfile() {
    this.closeNotifPanel();
    this.route.navigate(['/profile-index']);
  }
  configuracion() {
    this.closeNotifPanel();
    this.route.navigate(['/configuracion']);
  }

  get firstLetter(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '';
  }

  // --- Métodos del panel de notificaciones ---
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
    // Aquí va tu lógica real de marcar como leídas
    this.closeNotifPanel();
  }

  clearAll() {
    // Aquí va tu lógica real de limpiar
    this.closeNotifPanel();
  }

  viewAll() {
    this.closeNotifPanel();
    this.route.navigate(['/notifications']); // Ajusta a tu ruta real
  }
}
