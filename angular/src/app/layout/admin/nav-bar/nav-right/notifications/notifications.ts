/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Notification } from 'src/app/generic/Models/Entitys';
import { NotificationHubService } from 'src/app/services/notification-hub.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule,FormsModule  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private sub!: Subscription;
  parkingId = 1; // 🔹 Temporal, luego lo pones dinámico según login/parking seleccionado

  constructor(
    private hubService: NotificationHubService,
    private apiService: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. Traer notificaciones iniciales desde REST
    this.apiService.getByParking(this.parkingId).subscribe(res => {
      this.notifications = res;
    });

    // 2. Suscribirse a notificaciones en tiempo real (SignalR)
    this.hubService.startConnection(this.parkingId);
    this.sub = this.hubService.notifications$.subscribe(n => {
      this.notifications = n;
    });
  }

  markAsRead(notification: Notification) {
    this.apiService.markAsRead(notification.id).subscribe(() => {
      notification.isRead = true;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hubService.stopConnection();
  }
}
