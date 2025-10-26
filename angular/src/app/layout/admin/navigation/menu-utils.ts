// src/app/utils/menu-utils.ts

import { NavigationItem } from "./navigation";

export interface FlatMenuItem {
  id: string;
  title: string;
  url?: string;
  parents: string[];   // ids de padres
  fullPath: string;    // "Grupo > Collapse > Item"
}

export function flattenMenu(items: NavigationItem[], parentStack: NavigationItem[] = []): FlatMenuItem[] {
  const out: FlatMenuItem[] = [];
  for (const item of items) {
    const parents = parentStack.map(p => p.id);
    const fullPath = [...parentStack.map(p => p.title), item.title].join(' > ');
    out.push({ id: item.id, title: item.title, url: item.url, parents, fullPath });
    if (item.children && item.children.length) {
      out.push(...flattenMenu(item.children, [...parentStack, item]));
    }
  }
  return out;
}
