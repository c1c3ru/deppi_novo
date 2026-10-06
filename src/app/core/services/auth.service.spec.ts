import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { AnalyticsService } from './analytics.service';
import { environment } from '../../../environments/environment';

const MIN = 60 * 1000;
const START = new Date('2026-10-06T12:00:00Z');

function fakeToken(expiresInMs: number): string {
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  const payload = btoa(JSON.stringify({ id: 1, exp }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

const user = {
  id: 1,
  registration: '1234567',
  name: 'Servidor',
  email: 'servidor@ifce.edu.br',
  roles: ['admin'],
};

describe('AuthService (sessão)', () => {
  let http: HttpTestingController;
  const api = environment.apiUrl;

  function createService(): AuthService {
    return TestBed.inject(AuthService);
  }

  function login(service: AuthService): void {
    service.login({ registration: '1234567', password: 'x' }).subscribe();
    http.expectOne(`${api}/auth/login`).flush({
      accessToken: fakeToken(60 * MIN),
      refreshToken: 'refresh-1',
      user,
    });
  }

  /** Avança o relógio com o usuário interagindo a cada minuto */
  function advanceActive(minutes: number): void {
    for (let i = 0; i < minutes; i++) {
      window.dispatchEvent(new Event('click'));
      jasmine.clock().tick(MIN);
    }
  }

  beforeEach(() => {
    localStorage.clear();
    jasmine.clock().install();
    jasmine.clock().mockDate(START);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: AnalyticsService,
          useValue: jasmine.createSpyObj('AnalyticsService', ['trackEvent']),
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    localStorage.clear();
  });

  it('renova o token 10 min antes de expirar e continua renovando', () => {
    const service = createService();
    login(service);

    advanceActive(49);
    http.expectNone(`${api}/auth/refresh`);

    advanceActive(1);
    http.expectOne(`${api}/auth/refresh`).flush({
      accessToken: fakeToken(60 * MIN),
      refreshToken: 'refresh-1',
    });

    advanceActive(49);
    http.expectNone(`${api}/auth/refresh`);
    advanceActive(1);
    http.expectOne(`${api}/auth/refresh`);
    expect(service.isAuthenticated).toBeTrue();
  });

  it('não grava "undefined" no usuário quando o refresh não traz o user', () => {
    const service = createService();
    login(service);

    advanceActive(50);
    http.expectOne(`${api}/auth/refresh`).flush({
      accessToken: fakeToken(60 * MIN),
      refreshToken: 'refresh-1',
    });

    expect(localStorage.getItem('current_user')).toBe(JSON.stringify(user));
  });

  it('encerra a sessão após 30 min sem atividade', () => {
    const service = createService();
    login(service);

    jasmine.clock().tick(29 * MIN);
    expect(service.isAuthenticated).toBeTrue();

    jasmine.clock().tick(2 * MIN);
    http.expectOne(`${api}/auth/logout`).flush({});
    expect(service.isAuthenticated).toBeFalse();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('atividade do usuário adia o logout por inatividade', () => {
    const service = createService();
    login(service);

    jasmine.clock().tick(20 * MIN);
    window.dispatchEvent(new Event('mousemove'));
    jasmine.clock().tick(20 * MIN);
    expect(service.isAuthenticated).toBeTrue();
  });

  it('não restaura sessão parada há mais de 30 min ao abrir o site', () => {
    localStorage.setItem('auth_token', fakeToken(60 * MIN));
    localStorage.setItem('refresh_token', 'refresh-1');
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('last_activity', String(Date.now() - 31 * MIN));

    const service = createService();
    expect(service.isAuthenticated).toBeFalse();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('com token expirado ao recarregar, renova na hora', () => {
    localStorage.setItem('auth_token', fakeToken(-5 * MIN));
    localStorage.setItem('refresh_token', 'refresh-1');
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('last_activity', String(Date.now() - 1 * MIN));

    const service = createService();
    expect(service.isAuthenticated).toBeTrue();
    jasmine.clock().tick(0);
    http.expectOne(`${api}/auth/refresh`);
  });
});
