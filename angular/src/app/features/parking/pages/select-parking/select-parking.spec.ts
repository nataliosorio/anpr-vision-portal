import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectParking } from './select-parking';

describe('SelectParking', () => {
  let component: SelectParking;
  let fixture: ComponentFixture<SelectParking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectParking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectParking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
