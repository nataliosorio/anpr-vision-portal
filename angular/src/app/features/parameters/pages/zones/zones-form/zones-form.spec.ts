import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonesForm } from './zones-form';

describe('ZonesForm', () => {
  let component: ZonesForm;
  let fixture: ComponentFixture<ZonesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
