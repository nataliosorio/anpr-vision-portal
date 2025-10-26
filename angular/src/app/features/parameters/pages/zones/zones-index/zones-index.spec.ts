import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonesIndex } from './zones-index';

describe('ZonesIndex', () => {
  let component: ZonesIndex;
  let fixture: ComponentFixture<ZonesIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonesIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonesIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
