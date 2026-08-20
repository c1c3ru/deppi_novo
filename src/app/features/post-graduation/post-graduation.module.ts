import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PostGraduationComponent } from './post-graduation.component';

@NgModule({
  declarations: [PostGraduationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostGraduationComponent,
      },
    ]),
  ],
})
export class PostGraduationModule {}
