/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/components/nav-content/nav-content.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

// project import
import { NavigationItem, NavigationItems } from '../navigation';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavigationService } from '../navigation.service';
import { OpenCommand, SharedMenuService } from '../shared-menu.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenuApiService } from 'src/app/layout/services/menu-api.service';


@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);

  // inyectados de servicio
  private navigationService = inject(NavigationService);
  private sharedMenu = inject(SharedMenuService);
  private router = inject(Router);
  private menuApi = inject(MenuApiService);

  private cmdSub?: Subscription;

  // version
  title = 'Demo application for version numbering';
  // currentApplicationVersion = environment.appVersion;

  // public pops
  navigation: NavigationItem[];
  contentWidth: number;
  wrapperWidth!: number;
  scrollWidth: number;
  windowWidth: number;

  NavMobCollapse = (window as any).output ? (window as any).output() : (() => {})(); // mantiene compatibilidad con tu original

  // constructor
  constructor() {
    this.navigation = NavigationItems;
    this.windowWidth = window.innerWidth;
    this.scrollWidth = 0;
    this.contentWidth = 0;
  }

  // life cycle event
  ngOnInit() {
    // 🧭 Cargar menú dinámico desde el backend
    this.menuApi.getUserMenu().subscribe({
      next: (menu) => {
        this.navigation = menu;
        this.navigationService.setMenu(menu);
      },
      error: (err) => {
        console.error('Error cargando menú dinámico:', err.message || err);
        // fallback al menú estático
        this.navigation = NavigationItems;
        this.navigationService.setMenu(NavigationItems);
      }
    });

    // 🔁 Suscripción para comandos de búsqueda o apertura directa
    this.cmdSub = this.sharedMenu.openObservable$.subscribe((cmd: OpenCommand) => {
      if (cmd) this.openAndHighlight(cmd);
    });

    // ⚙️ Ajustes de UI responsiva
    if (this.windowWidth < 992) {
      setTimeout(() => {
        document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
        (document.querySelector('#nav-ps-gradient-able') as HTMLElement).style.height = '100%';
      }, 500);
    }
  }
  ngOnDestroy() {
    this.cmdSub?.unsubscribe();
  }

  fireLeave() {
    const sections = document.querySelectorAll('.pcoded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.remove('active');
      sections[i].classList.remove('pcoded-trigger');
    }

    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      (this.NavMobCollapse as any).emit?.();
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  // --- Nuevas funciones: abrir / expandir / resaltar item recibido desde el buscador ---
  openAndHighlight(cmd: OpenCommand) {
    if (cmd.id) {
      // buscar elemento por data-menu-id
      const el = document.querySelector(`[data-menu-id="${cmd.id}"]`) as HTMLElement | null;
      if (el) {
        this.expandParentsByElement(el);
        this.scrollAndFlash(el);
        // si el item tiene un <a> con href y navigate solicitado, navegar
        const anchor = el.tagName.toLowerCase() === 'a' ? el : el.querySelector('a.nav-link') as HTMLAnchorElement | null;
        const href = anchor?.getAttribute('href') || cmd.url;
        if (cmd.navigate && href) {
          // navegar mediante router
          try { this.router.navigateByUrl(href); } catch (err) { /* fallback: location change */ }
        }
        return;
      }
    }

    // fallback por url (si no se encontro por id)
    if (cmd.url) {
      const link = `a.nav-link[href='${cmd.url}']`;
      const anchor = document.querySelector(link) as HTMLElement | null;
      if (anchor) {
        const parent = anchor.parentElement;
        if (parent?.classList.contains('pcoded-hasmenu')) {
          parent.classList.add('pcoded-trigger', 'active');
        } else {
          const up_parent = parent?.parentElement?.parentElement;
          if (up_parent?.classList.contains('pcoded-hasmenu')) {
            up_parent.classList.add('pcoded-trigger', 'active');
          }
        }
        this.scrollAndFlash(anchor);
        if (cmd.navigate) this.router.navigateByUrl(cmd.url);
      }
    }
  }

  private expandParentsByElement(el: HTMLElement) {
    // sube por los padres y agrega las clases que tu tema usa para expandir (pcoded-trigger, active)
    let p: HTMLElement | null = el.parentElement;
    while (p) {
      if (p.classList && p.classList.contains('pcoded-hasmenu')) {
        p.classList.add('pcoded-trigger', 'active');
      }
      p = p.parentElement;
    }
  }

  private scrollAndFlash(el: HTMLElement) {
    try {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) { /* ignore */ }

    el.classList.add('menu-highlight');
    setTimeout(() => el.classList.remove('menu-highlight'), 1500);
  }
}
