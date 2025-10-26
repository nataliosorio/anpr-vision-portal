import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorsIndex } from './sectors-index';

describe('SectorsIndex', () => {
  let component: SectorsIndex;
  let fixture: ComponentFixture<SectorsIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorsIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorsIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
