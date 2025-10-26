import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorDialog } from './sector-dialog';

describe('SectorDialog', () => {
  let component: SectorDialog;
  let fixture: ComponentFixture<SectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
