import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTempForm } from './client-temp-form';

describe('ClientTempForm', () => {
  let component: ClientTempForm;
  let fixture: ComponentFixture<ClientTempForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTempForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTempForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
