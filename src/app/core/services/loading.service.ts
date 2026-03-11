import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();

  setLoading(isLoading: boolean): void {
    if (isLoading) {
      this.activeRequests++;
    } else {
      this.activeRequests--;
    }

    if (this.activeRequests < 0) this.activeRequests = 0;
    this.loadingSubject.next(this.activeRequests > 0);
  }

  forceStop(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }
}
