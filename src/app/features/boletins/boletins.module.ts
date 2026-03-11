import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { QuillModule } from 'ngx-quill';

// Components
import { BoletinsComponent } from './components/boletins/boletins.component';
import { BoletimListComponent } from './components/boletim-list/boletim-list.component';
import { BoletimDetailComponent } from './components/boletim-detail/boletim-detail.component';
import { LoginComponent } from './components/login/login.component';
import { BoletimFormComponent } from './components/boletim-form/boletim-form.component';

// Services
import { BoletinsService } from './services/boletins.service';

// Store
import { boletinsReducer } from './store/boletins.reducer';
import { BoletinsEffects } from './store/boletins.effects';

// Guards
import { BoletinsGuard } from './guards/boletins.guard';

// SharedModule
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: BoletinsComponent,
    children: [
      {
        path: '',
        component: BoletimListComponent,
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: ':id',
        component: BoletimDetailComponent,
      },
      {
        path: 'admin/novo',
        component: BoletimFormComponent,
        canActivate: [BoletinsGuard],
      },
      {
        path: 'admin/:id/editar',
        component: BoletimFormComponent,
        canActivate: [BoletinsGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [
    BoletinsComponent,
    BoletimListComponent,
    BoletimDetailComponent,
    LoginComponent,
    BoletimFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature('boletins', boletinsReducer),
    EffectsModule.forFeature([BoletinsEffects]),
    QuillModule.forRoot(),
  ],
  providers: [BoletinsService, BoletinsGuard],
})
export class BoletinsModule {}
