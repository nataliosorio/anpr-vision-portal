// Angular Import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { LoaderComponent } from './shared/components/loader/loader.component';

// project import

@Component({
  selector: 'app-root',
  imports: [RouterModule, SpinnerComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  // life cycle event
  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
