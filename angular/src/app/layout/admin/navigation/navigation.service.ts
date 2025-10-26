// src/app/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavigationItem } from './navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private menu$ = new BehaviorSubject<NavigationItem[]>([]);
  menuObservable$ = this.menu$.asObservable();

  setMenu(menu: NavigationItem[]) {
    this.menu$.next(menu || []);
  }

  getMenuSnapshot(): NavigationItem[] {
    return this.menu$.getValue();
  }
}
