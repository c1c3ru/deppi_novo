import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { QuillModule } from 'ngx-quill';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { environment } from '../environments/environment';

// Core Module
import { CoreModule } from './core/core.module';

// Shared Module
import { SharedModule } from './shared/shared.module';

// Layout Module
import { LayoutModule } from './layout/layout.module';

// Root Component
import { AppComponent } from './app.component';

// HTTP Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

// Store
import { reducers, metaReducers } from './store';
import { CustomSerializer } from './store/router/custom-serializer';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // NgRx
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 25,
      connectInZone: true,
    }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot({
      serializer: CustomSerializer,
    }),

    // Internationalization
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'pt-br',
    }),

    // Global Rich Text Editor Config
    QuillModule.forRoot(),

    // Service Worker
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // Core Module (singleton services)
    CoreModule,

    // Shared Module (components, directives, pipes)
    SharedModule,

    // Layout Module (header, footer, sidebar)
    LayoutModule,

    // Feature Modules (lazy loaded)
    RouterModule.forRoot(
      [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: 'home',
        },
        {
          path: 'home',
          loadChildren: () =>
            import('./features/home/home.module').then((m) => m.HomeModule),
        },
        {
          path: 'research',
          loadChildren: () =>
            import('./features/research/research.module').then(
              (m) => m.ResearchModule
            ),
        },
        {
          path: 'extension',
          loadChildren: () =>
            import('./features/extension/extension.module').then(
              (m) => m.ExtensionModule
            ),
        },
        {
          path: 'innovation',
          loadChildren: () =>
            import('./features/innovation/innovation.module').then(
              (m) => m.InnovationModule
            ),
        },
        {
          path: 'post-graduation',
          loadChildren: () =>
            import('./features/post-graduation/post-graduation.module').then(
              (m) => m.PostGraduationModule
            ),
        },
        {
          path: 'boletins',
          loadChildren: () =>
            import('./features/boletins/boletins.module').then(
              (m) => m.BoletinsModule
            ),
        },
        {
          path: 'contact',
          loadChildren: () =>
            import('./features/contact/contact.module').then(
              (m) => m.ContactModule
            ),
        },
        {
          path: 'privacy',
          loadChildren: () =>
            import('./features/privacy/privacy.module').then(
              (m) => m.PrivacyModule
            ),
        },
        {
          path: 'laboratorios',
          loadChildren: () =>
            import('./features/laboratorios/laboratorios.module').then(
              (m) => m.LaboratoriosModule
            ),
        },
        {
          path: 'pit-rit',
          loadChildren: () =>
            import('./features/pit-rit/pit-rit.module').then(
              (m) => m.PitRitModule
            ),
        },
        {
          path: '**',
          redirectTo: 'home',
        },
      ],
      {
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
        paramsInheritanceStrategy: 'always',
      }
    ),
  ],
  providers: [
    // HTTP Interceptors (order matters)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    provideNgxMask(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    // Inicialização global da aplicação
  }
}
