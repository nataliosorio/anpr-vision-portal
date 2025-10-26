/* eslint-disable @angular-eslint/no-output-native */
// src/app/components/nav-search/nav-search.component.ts
import { Component, ElementRef, ViewChild, HostListener, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';


import { Router } from '@angular/router';
import { FlatMenuItem, flattenMenu } from '../../../navigation/menu-utils';
import { NavigationService } from '../../../navigation/navigation.service';
import { SharedMenuService } from '../../../navigation/shared-menu.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-nav-search',
  standalone: true, // si tu proyecto NO usa standalone, quita esta línea y declara el componente en el módulo
  imports: [SharedModule, CommonModule, FormsModule],
  templateUrl: './nav-search.component.html',
  styleUrls: ['./nav-search.component.scss']
})
export class NavSearchComponent implements OnDestroy {
  @Output() search = new EventEmitter<string>();

  // estado
  searchOn = false;
  query = '';
  suggestions: FlatMenuItem[] = [];
  flat: FlatMenuItem[] = [];
  suggestionIndex = -1;

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild('searchInput', { static: false }) inputEl!: ElementRef<HTMLInputElement>;

  // inyectados
  private navigationService = inject(NavigationService);
  private sharedMenu = inject(SharedMenuService);
  private router = inject(Router);

  constructor() {
    // cuando el menú cambie, recalculamos la lista plana
    this.navigationService.menuObservable$.pipe(takeUntil(this.destroy$)).subscribe(menu => {
      this.flat = flattenMenu(menu || []);
    });

    // debounce para evitar muchas llamadas y mejorar UX
    this.input$.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe(q => this.searchMenu(q));
  }

  openSearch() {
    this.searchOn = true;
    // foco tras render
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 0);
  }

  closeSearch() {
    this.searchOn = false;
    this.query = '';
    this.suggestions = [];
    this.suggestionIndex = -1;
  }

  clear() {
    this.query = '';
    this.suggestions = [];
    this.suggestionIndex = -1;
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 0);
  }

  onInput() {
    this.input$.next(this.query ?? '');
  }

  // búsqueda sencilla sobre la lista plana (puedes cambiar a Fuse.js si quieres fuzzy)
  private searchMenu(q: string) {
    const t = (q || '').trim().toLowerCase();
    if (!t) {
      this.suggestions = [];
      return;
    }

    this.suggestions = this.flat.filter(i =>
      (i.title || '').toLowerCase().includes(t) ||
      (i.fullPath || '').toLowerCase().includes(t) ||
      (i.url || '').toLowerCase().includes(t)
    ).slice(0, 8);
    this.suggestionIndex = -1;
  }

 selectSuggestion(item: FlatMenuItem) {
  // no navegues aquí: deja que el sidebar haga la navegación cuando encuentre el elemento
  this.sharedMenu.openItem({ id: item.id, url: item.url, navigate: true });
  this.search.emit(item.title);
  this.closeSearch();
}



  // teclado: Escape, Enter, ArrowUp/Down
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.closeSearch();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.suggestionIndex >= 0 && this.suggestions[this.suggestionIndex]) {
        this.selectSuggestion(this.suggestions[this.suggestionIndex]);
      } else if (this.query) {
        // buscar término libre: emitir y cerrar
        this.search.emit(this.query);
        this.closeSearch();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.suggestions.length) return;
      this.suggestionIndex = Math.min(this.suggestionIndex + 1, this.suggestions.length - 1);
      this.scrollActiveIntoView();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.suggestions.length) return;
      this.suggestionIndex = Math.max(this.suggestionIndex - 1, 0);
      this.scrollActiveIntoView();
      return;
    }
  }

  private scrollActiveIntoView() {
    // que la sugestión activa sea visible
    setTimeout(() => {
      const ul = document.querySelector('.suggestions');
      const active = ul?.querySelector('.active') as HTMLElement | null;
      if (active && ul) {
        const aRect = active.getBoundingClientRect();
        const ulRect = ul.getBoundingClientRect();
        if (aRect.top < ulRect.top) active.scrollIntoView({ block: 'nearest' });
        if (aRect.bottom > ulRect.bottom) active.scrollIntoView({ block: 'nearest' });
      }
    }, 0);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(_: KeyboardEvent) {
    if (this.searchOn) this.closeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
