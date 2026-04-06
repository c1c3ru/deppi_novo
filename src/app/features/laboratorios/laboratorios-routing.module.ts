import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabListComponent } from './components/lab-list/lab-list.component';
import { LabDetailComponent } from './components/lab-detail/lab-detail.component';
import { LabFormComponent } from './components/lab-form/lab-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LabListComponent },
  { path: ':id', component: LabDetailComponent },
  { path: ':id/editar', component: LabFormComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboratoriosRoutingModule { }
