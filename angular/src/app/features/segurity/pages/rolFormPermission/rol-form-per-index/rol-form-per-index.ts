/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import Swal from 'sweetalert2';
import { General } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-rol-form-per-index',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatCardModule],
  templateUrl: './rol-form-per-index.html',
  styleUrl: './rol-form-per-index.scss'
})
export class RolFormPerIndex implements OnInit {
  roles: Array<{ id: number; name: string; hasPermissions?: boolean }> = [];
  filteredRoles: Array<{ id: number; name: string; hasPermissions?: boolean }> = [];

  private _generalService = inject(General);
  private router = inject(Router);

  ngOnInit(): void {
    this.getRolesWithPermissions();
  }

  getRolesWithPermissions(): void {
    // Obtener todos los roles
    this._generalService.get<Array<{ id: number; name: string }>>('Rol/select').subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.filteredRoles = [...this.roles];

        // Para cada rol, verificar si tiene permisos asociados
        const permissionChecks = this.roles.map(role =>
          this._generalService.get(`RolFormPermission/byRol/${role.id}`).subscribe({
            next: (res: any) => {
              role.hasPermissions = (res?.data?.forms?.length || res?.forms?.length) > 0;
              this.updateFilteredRoles();
            },
            error: () => {
              role.hasPermissions = false;
              this.updateFilteredRoles();
            }
          })
        );

        // Ejecutar todas las verificaciones
        if (permissionChecks.length > 0) {
          import('rxjs').then(rxjs => {
            rxjs.forkJoin(permissionChecks).subscribe();
          });
        }
      },
      error: (err: Error) => {
        Swal.fire('Error', err.message || 'No se pudieron cargar los roles.', 'error');
        this.roles = [];
        this.filteredRoles = [];
      }
    });
  }

  private updateFilteredRoles(): void {
    this.filteredRoles = [...this.roles];
  }

  goToCreate(): void {
    this.router.navigate(['/rolFormPermission-form']);
  }

  goToEdit(rolId: number): void {
    this.router.navigate(['/rolFormPermission-form', rolId]);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.name.toLowerCase().includes(filterValue)
    );
  }
}
