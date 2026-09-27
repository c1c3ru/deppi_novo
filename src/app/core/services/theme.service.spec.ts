import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.removeItem('theme');
    localStorage.removeItem('theme-preference');
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.removeItem('theme');
    localStorage.removeItem('theme-preference');
  });

  it('abre no modo claro mesmo com o sistema no escuro', () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);
    service.initTheme();
    expect(service.getCurrentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('descarta o "dark" gravado pela lógica antiga', () => {
    localStorage.setItem('theme', 'dark');
    service.initTheme();
    expect(service.getCurrentTheme()).toBe('light');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('respeita o escuro quando a pessoa escolheu no botão', () => {
    service.toggleTheme();
    expect(localStorage.getItem('theme-preference')).toBe('dark');
    service.initTheme();
    expect(service.getCurrentTheme()).toBe('dark');
  });
});
