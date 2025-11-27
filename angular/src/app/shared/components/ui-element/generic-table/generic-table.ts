import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { General } from 'src/app/core/services/general.service';
import { FormatDatePipe } from 'src/app/shared/formatDate/format-date-pipe';

@Component({
  selector: 'app-generic-table',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, CommonModule, FormsModule, MatTooltipModule, FormatDatePipe],
  templateUrl: './generic-table.html',
  styleUrl: './generic-table.scss'
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class GenericTable<T = any> implements OnInit, AfterViewInit, OnChanges {
  @Input() columns: { key: string, label: string }[] = [];
  @Input() data: T[] = [];
  @Input() showActions: boolean = false;

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<number>();
  @Output() deletePermanent = new EventEmitter<number>();

  dataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];
  userRoles: string[] = [];
  isAdmin: boolean = false;
isUser: boolean = false;
searchText: string = '';


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private service = inject(General);


  ngOnInit(): void {
    this.loadUserRoles();
    this.displayedColumns = this.columns.map(c => c.key);
    if (this.showActions) this.displayedColumns.push('acciones');

    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
  }

 loadUserRoles(): void {
  const roles = this.service.getUserRoles();
  this.userRoles = roles;

  // Reinicia los flags
  this.isAdmin = false;
  this.isUser = false;

  // Asigna según los roles
  for (const role of this.userRoles) {
    if (role === 'Administrador') {
      this.isAdmin = true;
    }
    if (role === 'Usuario') {
      this.isUser = true;
    }
  }

  console.log('isAdmin:', this.isAdmin);
  console.log('isUser:', this.isUser);
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.searchText = filterValue.trim().toLowerCase();
  this.dataSource.filter = this.searchText;
}

clearFilter() {
  this.searchText = '';
  this.dataSource.filter = '';
}

getColumnWidth(columnKey: string): string {
  const widthMap: { [key: string]: string } = {
    'vehicle': '150px',
    'reason': '250px',
    'restrictionDate': '150px',
    'asset': '100px',
    'isDeleted': '120px',
    'starHour': '120px',
    'endHour': '120px',
    'acciones': '200px'
  };
  return widthMap[columnKey] || '200px';
}

formatTime(timeString: string): string {
  if (!timeString) return '';

  try {
    // Si contiene fecha y hora (ej: "2021-01-01T12:00:00")
    if (timeString.includes('T') || timeString.includes('-')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-1); // Último dígito del año
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
        return `${day}/${month}/${year}, ${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }
    }

    // Si viene como HH:mm o HH:mm:ss, extraer horas y minutos
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch {
    return timeString; // Si hay error, devolver el string original
  }
}

}
