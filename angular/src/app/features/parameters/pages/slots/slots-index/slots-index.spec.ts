import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotsIndex } from './slots-index';

describe('SlotsIndex', () => {
  let component: SlotsIndex;
  let fixture: ComponentFixture<SlotsIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotsIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotsIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
