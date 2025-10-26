// src/app/services/shared-menu.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface OpenCommand {
  id?: string;       // id del item objetivo (preferible)
  url?: string;      // o url (fallback)
  navigate?: boolean; // si debe navegar (router)
}

@Injectable({ providedIn: 'root' })
export class SharedMenuService {
  private open$ = new Subject<OpenCommand>();
  openObservable$ = this.open$.asObservable();

  openItem(cmd: OpenCommand) {
    this.open$.next(cmd);
  }
}
