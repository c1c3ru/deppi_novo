import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    // Shared components will be added here
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule
    // Shared components will be exported here
  ]
})
export class SharedModule {
  constructor() {
    console.log('🔗 SharedModule loaded');
  }
}
