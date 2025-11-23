// angular import
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/shared/shared.module';

// service

@Component({
  selector: 'app-nav-item',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {
  // public props
  item = input<NavigationItem>();

  // public method
  closeOtherMenu(event: MouseEvent) {
    const ele = event.target as HTMLElement;
    if (ele !== null && ele !== undefined) {
      // Encontrar el menú padre más cercano que contiene este item
      let parentMenu: HTMLElement | null = null;
      let current: HTMLElement | null = ele;
      while (current && !parentMenu) {
        if (current.classList.contains('pcoded-hasmenu')) {
          parentMenu = current;
        }
        current = current.parentElement;
      }

      // Cerrar otros submenús al hacer clic en items, pero mantener abierto el menú padre
      const sections = document.querySelectorAll('.pcoded-hasmenu');
      for (let i = 0; i < sections.length; i++) {
        if (sections[i] !== parentMenu) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('pcoded-trigger');
        }
      }

      // Activar el menú correspondiente si es necesario
      if (parentMenu) {
        parentMenu.classList.add('pcoded-trigger');
        parentMenu.classList.add('active');
      }
    }
    if (document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      document.querySelector('app-navigation.pcoded-navbar')?.classList.remove('mob-open');
    }
  }
}
