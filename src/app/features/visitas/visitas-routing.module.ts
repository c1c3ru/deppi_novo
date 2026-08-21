import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitasPublicComponent } from './public/visitas-public.component';
import { VisitasAdminComponent } from './admin/visitas-admin.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: VisitasPublicComponent,
  },
  {
    path: 'admin',
    component: VisitasAdminComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitasRoutingModule {}
