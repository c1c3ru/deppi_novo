import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BoletinsService } from '../services/boletins.service';
import {
  loadBoletins,
  loadBoletinsSuccess,
  loadBoletinsFailure,
} from './boletins.reducer';

@Injectable()
export class BoletinsEffects {
  private readonly actions$ = inject(Actions);
  private readonly boletinsService = inject(BoletinsService);

  loadBoletins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBoletins),
      switchMap(() =>
        this.boletinsService.getAll().pipe(
          map((response) => loadBoletinsSuccess({ boletins: response.data })),
          catchError((error) =>
            of(
              loadBoletinsFailure({
                error: error.message ?? 'Erro ao carregar boletins',
              })
            )
          )
        )
      )
    )
  );
}
