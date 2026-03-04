import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';

// Import custom reducers here as they are created
// import { authReducer, AuthState } from '../features/auth/store/auth.reducer';

export interface AppState {
  router: RouterReducerState;
  // Add other state slices here
  // auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  // Add other reducers here
  // auth: authReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
