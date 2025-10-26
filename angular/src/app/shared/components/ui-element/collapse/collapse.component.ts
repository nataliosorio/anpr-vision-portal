// angular import
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

// project import

@Component({
  selector: 'app-collapse',
  imports: [SharedModule],
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent {
  // Public props
  isCollapsed = true;
  isMultiCollapsed1 = true;
  isMultiCollapsed2 = true;

  items = ['First', 'Second', 'Third'];
}
