import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

// Components
import { AnaisShellComponent } from './components/anais-shell/anais-shell.component';
import { AnaisInicioComponent } from './components/inicio/inicio.component';
import { AnaisEdicaoViewComponent } from './components/edicao-view/edicao-view.component';
import { AnaisTrabalhosListComponent } from './components/trabalhos-list/trabalhos-list.component';
import { AnaisEdicoesListComponent } from './components/edicoes-list/edicoes-list.component';
import { AnaisArtigoDetailComponent } from './components/artigo-detail/artigo-detail.component';
import { AnaisNormasComponent } from './components/normas/normas.component';
import { AnaisCorpoEditorialComponent } from './components/corpo-editorial/corpo-editorial.component';
import { AnaisExpedienteComponent } from './components/expediente/expediente.component';
import { AnaisEdicaoFormComponent } from './components/edicao-form/edicao-form.component';
import { AnaisArtigoFormComponent } from './components/artigo-form/artigo-form.component';
import { AnaisImportacaoLoteComponent } from './components/importacao-lote/importacao-lote.component';

// Services
import { AnaisService } from './services/anais.service';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';

// SharedModule
import { SharedModule } from '../../shared/shared.module';

export const ANAIS_ROUTES: Routes = [
  {
    path: '',
    component: AnaisShellComponent,
    children: [
      { path: '', component: AnaisInicioComponent, pathMatch: 'full' },
      { path: 'edicao-atual', component: AnaisEdicaoViewComponent },
      { path: 'edicoes', component: AnaisEdicoesListComponent },
      { path: 'edicoes/:id', component: AnaisEdicaoViewComponent },
      { path: 'artigos/:id', component: AnaisArtigoDetailComponent },
      { path: 'normas', component: AnaisNormasComponent },
      { path: 'corpo-editorial', component: AnaisCorpoEditorialComponent },
      { path: 'expediente', component: AnaisExpedienteComponent },
      {
        path: 'admin/edicoes/nova',
        component: AnaisEdicaoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/edicoes/:id/editar',
        component: AnaisEdicaoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/edicoes/:edicaoId/artigos/novo',
        component: AnaisArtigoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/importar',
        component: AnaisImportacaoLoteComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/edicoes/:edicaoId/importar',
        component: AnaisImportacaoLoteComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin/artigos/:id/editar',
        component: AnaisArtigoFormComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [
    AnaisShellComponent,
    AnaisInicioComponent,
    AnaisEdicaoViewComponent,
    AnaisTrabalhosListComponent,
    AnaisEdicoesListComponent,
    AnaisArtigoDetailComponent,
    AnaisNormasComponent,
    AnaisCorpoEditorialComponent,
    AnaisExpedienteComponent,
    AnaisEdicaoFormComponent,
    AnaisArtigoFormComponent,
    AnaisImportacaoLoteComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(ANAIS_ROUTES),
    SharedModule,
    QuillModule.forRoot(),
  ],
  providers: [AnaisService],
})
export class AnaisModule {}
