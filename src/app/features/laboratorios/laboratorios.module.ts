import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LaboratoriosRoutingModule } from './laboratorios-routing.module';
import { LabListComponent } from './components/lab-list/lab-list.component';
import { LabDetailComponent } from './components/lab-detail/lab-detail.component';
import { LabFormComponent } from './components/lab-form/lab-form.component';

@NgModule({
  declarations: [
    LabListComponent,
    LabDetailComponent,
    LabFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LaboratoriosRoutingModule
  ]
})
export class LaboratoriosModule { }
