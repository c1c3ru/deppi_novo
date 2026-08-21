import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { VisitasRoutingModule } from './visitas-routing.module';
import { VisitasPublicComponent } from './public/visitas-public.component';
import { VisitasAdminComponent } from './admin/visitas-admin.component';

@NgModule({
  declarations: [VisitasPublicComponent, VisitasAdminComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    VisitasRoutingModule,
  ],
})
export class VisitasModule {}
