/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-sector-dialog',
  imports: [
     MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './sector-dialog.html',
  styleUrl: './sector-dialog.scss'
})
export class SectorDialog {
selectedSlot: any = null;

  constructor(@Inject(MAT_DIALOG_DATA) public sector: any) {}

  selectSlot(slot: any) {
    this.selectedSlot = slot;
  }
}
