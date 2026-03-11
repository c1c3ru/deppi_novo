import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly loadingService = inject(LoadingService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Ignorar carregamento para algumas URLs se necessário
    const silentUrls = ['/health', '/assets/'];
    const isSilent = silentUrls.some((url) => request.url.includes(url));

    if (!isSilent) {
      this.loadingService.setLoading(true);
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!isSilent) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }
}
