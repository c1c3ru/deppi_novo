import { createReducer, on, createAction, props } from '@ngrx/store';
import { Boletim } from '../../../shared/models';

// Actions
export const loadBoletins = createAction('[Boletins] Load Boletins');
export const loadBoletinsSuccess = createAction(
  '[Boletins] Load Boletins Success',
  props<{ boletins: Boletim[] }>()
);
export const loadBoletinsFailure = createAction(
  '[Boletins] Load Boletins Failure',
  props<{ error: string }>()
);

// State
export interface BoletinsState {
  boletins: Boletim[];
  loading: boolean;
  error: string | null;
}

const initialState: BoletinsState = {
  boletins: [],
  loading: false,
  error: null,
};

// Reducer
export const boletinsReducer = createReducer(
  initialState,
  on(loadBoletins, (state) => ({ ...state, loading: true, error: null })),
  on(loadBoletinsSuccess, (state, { boletins }) => ({
    ...state,
    loading: false,
    boletins,
  })),
  on(loadBoletinsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
