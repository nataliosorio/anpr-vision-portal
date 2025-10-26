// angular import
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

// project import

@Component({
  selector: 'app-typography',
  imports: [SharedModule],
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.scss']
})
export class TypographyComponent {}
