// angular import
import { Component } from '@angular/core';

// project import
import { NavSearchComponent } from './nav-search/nav-search.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-nav-left',
  imports: [SharedModule, NavSearchComponent],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {}
