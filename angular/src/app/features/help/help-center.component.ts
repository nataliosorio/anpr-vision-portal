import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FaqComponent } from './faq/faq.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { ContactSupportComponent } from './contact-support/contact-support.component';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    FaqComponent,
    DocumentationComponent,
    ContactSupportComponent
  ],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent {}
