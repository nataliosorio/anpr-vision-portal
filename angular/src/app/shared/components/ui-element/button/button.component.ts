// angular import
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

// project import

@Component({
  selector: 'app-button',
  imports: [SharedModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {}
