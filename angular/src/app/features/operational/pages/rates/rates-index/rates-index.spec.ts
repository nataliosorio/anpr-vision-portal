import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesIndex } from './rates-index';

describe('RatesIndex', () => {
  let component: RatesIndex;
  let fixture: ComponentFixture<RatesIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatesIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatesIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
