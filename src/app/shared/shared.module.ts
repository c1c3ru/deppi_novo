import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  declarations: [
    // Shared components will be added here
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationComponent,
    LoadingComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    NotificationComponent,
    LoadingComponent,
  ],
})
export class SharedModule {
  constructor() {
    console.log('SharedModule loaded');
  }
}
