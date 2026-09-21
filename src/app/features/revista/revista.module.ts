import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

// Components
import { RevistaShellComponent } from './components/revista-shell/revista-shell.component';
import { RevistaApresentacaoComponent } from './components/apresentacao/apresentacao.component';
import { RevistaExpedienteComponent } from './components/expediente/expediente.component';
import { RevistaEdicoesListComponent } from './components/edicoes-list/edicoes-list.component';
import { RevistaEdicaoDetailComponent } from './components/edicao-detail/edicao-detail.component';
import { RevistaArtigoDetailComponent } from './components/artigo-detail/artigo-detail.component';
import { RevistaEdicaoFormComponent } from './components/edicao-form/edicao-form.component';
import { RevistaArtigoFormComponent } from './components/artigo-form/artigo-form.component';

// Services
import { RevistaService } from './services/revista.service';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';

// SharedModule
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: RevistaShellComponent,
    children: [
      { path: '', component: RevistaApresentacaoComponent, pathMatch: 'full' },
      { path: 'expediente', component: RevistaExpedienteComponent },
      { path: 'edicoes', component: RevistaEdicoesListComponent },
      { path: 'edicoes/:id', component: RevistaEdicaoDetailComponent },
      { path: 'artigos/:id', component: RevistaArtigoDetailComponent },
      {
        path: 'admin/edicoes/nova',
        component: RevistaEdicaoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/edicoes/:id/editar',
        component: RevistaEdicaoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/edicoes/:edicaoId/artigos/novo',
        component: RevistaArtigoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/artigos/:id/editar',
        component: RevistaArtigoFormComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [
    RevistaShellComponent,
    RevistaApresentacaoComponent,
    RevistaExpedienteComponent,
    RevistaEdicoesListComponent,
    RevistaEdicaoDetailComponent,
    RevistaArtigoDetailComponent,
    RevistaEdicaoFormComponent,
    RevistaArtigoFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    QuillModule.forRoot(),
  ],
  providers: [RevistaService],
})
export class RevistaModule {}
