import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Services
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { I18nService } from './services/i18n.service';
import { AnalyticsService } from './services/analytics.service';
import { NotificationService } from './services/notification.service';
import { StorageService } from './services/storage.service';
import { ValidationService } from './services/validation.service';
import { ApiClientService } from './services/api-client.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Directives
import * as coreDirectives from './directives';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    // Services
    AuthService,
    ThemeService,
    I18nService,
    AnalyticsService,
    NotificationService,
    StorageService,
    ValidationService,
    ApiClientService,

    // Guards
    AuthGuard,
    RoleGuard,

    // Directives
    ...Object.values(coreDirectives),
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule has already been loaded. Import CoreModule in the AppModule only.'
      );
    }
  }
}
