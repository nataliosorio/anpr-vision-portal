/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NavigationItem } from '../admin/navigation/navigation';
import { General } from 'src/app/core/services/general.service';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private general = inject(General);

  /** 🔹 MAPA DE FORMULARIOS A RUTAS QUEMADAS TEMPORALMENTE */
  /** 🔹 MAPA DE FORMULARIOS A RUTAS QUEMADAS (según DB y menú original) */
private formRouteMap: Record<string, string> = {
  'Principal': '/analytics',
  'Dashboard': '/analytics',

  // Monitoreo y control
  'Cámaras': '/cameras-index',
  'Vehículos': '/vehicles-index',
  'Distribución del Parqueadero': '/parking-management',

  // Módulo Operacional
  'Tarifas': '/rates-index',
  'Registros de Entradas': '/registeredVehicle-index',
  'Lista Negra': '/blackList-index',

  // Módulo de Parámetros
  'Clientes': '/client-index',
  'Tipo de Vehículos': '/TypeVehicle-index',
  'Tipo de Tarifas': '/RatesType-index',
  'Zonas': '/Zones-index',
  'Sectores': '/sectors-index',
  'Espacios': '/slots-index',

  // Módulo de Seguridad
  'Roles': '/role-index',
  'Permisos': '/permission-index',
  'Módulos': '/module-index',
  'Formularios por Módulos': '/form-module-index',
  'Permisos por Roles y Formularios': '/rolFormPermission-index',
  'Usuarios': '/user-index',
  'Personas': '/persons-index',

  // Configuración y soporte
  'Configuración': '/configuracion',
  'Ayuda': '/help-center'
};


  getUserMenu(): Observable<NavigationItem[]> {
    const userId = this.general.getUserId();
    const parkingId = this.general.getParkingId();

    if (!userId || !parkingId) {
      throw new Error('Faltan datos de usuario o parking en el almacenamiento local.');
    }

    const endpoint = `menu/by-user/${userId}/parking/${parkingId}`;
    return this.general.get<any>(endpoint).pipe(map((res) => this.mapMenuResponseToNavigation(res)));
  }

  /** 🔹 Convierte el DTO del backend a NavigationItem[] */
  private mapMenuResponseToNavigation(response: any): NavigationItem[] {
    if (!response || !response.roles) return [];

    const groups: NavigationItem[] = [];

    for (const role of response.roles) {
      const group: NavigationItem = {
        id: `role-${role.roleId}`,
        title: role.roleName,
        type: 'group',
        icon: 'icon-group',
        children: []
      };

      for (const module of role.modules) {
        const collapse: NavigationItem = {
          id: `module-${module.moduleId}`,
          title: module.moduleName,
          type: 'collapse',
          icon: this.pickIconByModuleName(module.moduleName),
          children: []
        };

        for (const form of module.forms) {
          // 🔹 Buscar URL quemada o generar una por defecto
          const route =
            this.formRouteMap[form.formName] ||
            `/${form.formName.replace(/\s+/g, '-').toLowerCase()}-index`;

          const item: NavigationItem = {
            id: `form-${form.formId}`,
            title: form.formName,
            type: 'item',
            url: route,
            icon: 'feather icon-file-text',
            classes: 'nav-item'
          };

          collapse.children!.push(item);
        }

        group.children!.push(collapse);
      }

      groups.push(group);
    }

    // 🚀 Grupo fijo de configuración
    groups.push({
      id: 'config',
      title: 'Configuración y Soporte',
      type: 'group',
      icon: 'icon-group',
      children: [
        {
          id: 'configuracion',
          title: 'Configuración',
          type: 'item',
          url: '/configuracion',
          icon: 'feather icon-settings'
        },
        {
          id: 'ayuda',
          title: 'Ayuda',
          type: 'item',
          url: '/help-center',
          icon: 'feather icon-help-circle'
        }
      ]
    });

    return groups;
  }

  /** 🔹 Íconos automáticos según el módulo */
  private pickIconByModuleName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('vehículo')) return 'feather icon-truck';
    if (lower.includes('seguridad')) return 'feather icon-lock';
    if (lower.includes('parámetro') || lower.includes('config')) return 'feather icon-sliders';
    if (lower.includes('factura')) return 'feather icon-printer';
    if (lower.includes('cliente')) return 'feather icon-user';
    if (lower.includes('zona')) return 'feather icon-map';
    return 'feather icon-box';
  }
}
