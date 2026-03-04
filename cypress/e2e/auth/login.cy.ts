import { testUserData } from '../../fixtures/user-data';

describe('Autenticação - Login', { tags: ['@auth', '@critical'] }, () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visitar página de login
    cy.visit('/boletins/login');
    
    // Verificar se está na página correta
    cy.url().should('include', '/boletins/login');
  });

  context('Campos do Formulário', () => {
    it('deve exibir todos os campos obrigatórios', () => {
      cy.get('[data-cy="login-form"]').should('be.visible');
      cy.get('[data-cy="registration-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.visible');
      
      // Verificar labels
      cy.get('[data-cy="registration-label"]').should('contain', 'Matrícula');
      cy.get('[data-cy="password-label"]').should('contain', 'Senha');
      cy.get('[data-cy="submit-button"]').should('contain', 'Entrar');
    });

    it('deve ter placeholders corretos', () => {
      cy.get('[data-cy="registration-input"]')
        .should('have.attr', 'placeholder', 'Digite sua matrícula');
      
      cy.get('[data-cy="password-input"]')
        .should('have.attr', 'placeholder', 'Digite sua senha');
    });

    it('deve ocultar senha por padrão', () => {
      cy.get('[data-cy="password-input"]')
        .should('have.attr', 'type', 'password');
    });
  });

  context('Validação de Campos', () => {
    it('deve mostrar erro para matrícula vazia', () => {
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('[data-cy="registration-error"]')
        .should('be.visible')
        .and('contain', 'Matrícula é obrigatória');
      
      cy.get('[data-cy="registration-input"]')
        .should('have.class', 'error');
    });

    it('deve mostrar erro para senha vazia', () => {
      cy.get('[data-cy="registration-input"]').type(testUserData.validUser.registration);
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('[data-cy="password-error"]')
        .should('be.visible')
        .and('contain', 'Senha é obrigatória');
      
      cy.get('[data-cy="password-input"]')
        .should('have.class', 'error');
    });

    it('deve limpar erros ao digitar', () => {
      // Disparar erro
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="registration-error"]').should('be.visible');
      
      // Digitar e limpar erro
      cy.get('[data-cy="registration-input"]').type(testUserData.validUser.registration);
      cy.get('[data-cy="registration-error"]').should('not.be.visible');
      cy.get('[data-cy="registration-input"]').should('not.have.class', 'error');
    });
  });

  context('Login com Sucesso', () => {
    it('deve fazer login com credenciais válidas', () => {
      // Preencher formulário
      cy.get('[data-cy="registration-input"]').type(testUserData.validUser.registration);
      cy.get('[data-cy="password-input"]').type(testUserData.validUser.password);
      
      // Submeter
      cy.get('[data-cy="submit-button"]').click();
      
      // Verificar estado de carregamento
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="loading-spinner"]').should('be.visible');
      
      // Verificar redirecionamento
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/boletins');
      
      // Verificar elementos da área logada
      cy.get('[data-cy="user-info"]').should('be.visible');
      cy.get('[data-cy="user-name"]').should('contain', testUserData.validUser.name);
      cy.get('[data-cy="user-registration"]').should('contain', testUserData.validUser.registration);
      cy.get('[data-cy="logout-button"]').should('be.visible');
      
      // Verificar se os boletins são exibidos
      cy.get('[data-cy="boletins-section"]').should('be.visible');
      cy.get('[data-cy="current-boletim"]').should('be.visible');
      cy.get('[data-cy="boletim-list"]').should('be.visible');
    });

    it('deve persistir sessão no localStorage', () => {
      // Fazer login
      cy.login(testUserData.validUser.registration, testUserData.validUser.password);
      
      // Verificar localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.exist;
        expect(win.localStorage.getItem('current_user')).to.exist;
        expect(win.localStorage.getItem('refresh_token')).to.exist;
      });
      
      // Recarregar página e manter sessão
      cy.reload();
      cy.get('[data-cy="user-info"]').should('be.visible');
    });
  });

  context('Login com Falha', () => {
    it('deve mostrar erro para credenciais inválidas', () => {
      cy.get('[data-cy="registration-input"]').type(testUserData.invalidUser.registration);
      cy.get('[data-cy="password-input"]').type(testUserData.invalidUser.password);
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('[data-cy="general-error"]')
        .should('be.visible')
        .and('contain', 'Matrícula ou senha inválidos');
      
      cy.url().should('include', '/login');
    });

    it('deve mostrar erro para matrícula não encontrada', () => {
      cy.get('[data-cy="registration-input"]').type('99999');
      cy.get('[data-cy="password-input"]').type('123456');
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('[data-cy="general-error"]')
        .should('be.visible')
        .and('contain', 'Matrícula ou senha inválidos');
    });

    it('deve mostrar erro para senha incorreta', () => {
      cy.get('[data-cy="registration-input"]').type(testUserData.validUser.registration);
      cy.get('[data-cy="password-input"]').type('wrongpassword');
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('[data-cy="general-error"]')
        .should('be.visible')
        .and('contain', 'Matrícula ou senha inválidos');
    });
  });

  context('Acessibilidade', () => {
    it('deve ser navegável por teclado', () => {
      // Navegação por Tab
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'registration-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'password-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'submit-button');
      
      // Enter para submeter
      cy.focused().type('{enter}');
      cy.get('[data-cy="registration-error"]').should('be.visible');
    });

    it('deve ter atributos ARIA corretos', () => {
      cy.get('[data-cy="registration-input"]')
        .should('have.attr', 'aria-required', 'true')
        .and('have.attr', 'aria-label', 'Matrícula');
      
      cy.get('[data-cy="password-input"]')
        .should('have.attr', 'aria-required', 'true')
        .and('have.attr', 'aria-label', 'Senha');
      
      // Erros devem ser anunciados
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="registration-error"]')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'polite');
    });
  });

  context('Responsividade', () => {
    ['iphone-x', 'ipad-2'].forEach((viewport) => {
      it(`deve funcionar corretamente em ${viewport}`, () => {
        cy.viewport(viewport);
        
        // Verificar layout mobile
        if (viewport === 'iphone-x') {
          cy.get('[data-cy="login-container"]').should('have.css', 'width', '100%');
        }
        
        // Testar login em mobile
        cy.login(testUserData.validUser.registration, testUserData.validUser.password);
        cy.get('[data-cy="boletins-section"]').should('be.visible');
      });
    });
  });

  context('Performance', () => {
    it('deve carregar página em tempo aceitável', () => {
      cy.visit('/boletins/login');
      
      // Medir tempo de carregamento
      cy.window().then((win) => {
        const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        // Page deve carregar em menos de 3 segundos
        expect(loadTime).to.be.lessThan(3000);
        cy.log(`Page load time: ${loadTime}ms`);
      });
    });

    it('deve completar login em tempo aceitável', () => {
      const startTime = Date.now();
      
      cy.login(testUserData.validUser.registration, testUserData.validUser.password);
      
      cy.get('[data-cy="boletins-section"]').should('be.visible').then(() => {
        const loginTime = Date.now() - startTime;
        
        // Login deve completar em menos de 5 segundos
        expect(loginTime).to.be.lessThan(5000);
        cy.log(`Login completion time: ${loginTime}ms`);
      });
    });
  });

  context('Segurança', () => {
    it('não deve expor senha no DOM', () => {
      cy.get('[data-cy="password-input"]').type('password123');
      
      // Verificar se senha não está em texto claro
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
      
      // Verificar se não há valor exposto em atributos
      cy.get('[data-cy="password-input"]').should('not.have.attr', 'value');
    });

    it('deve limpar dados sensíveis ao fazer logout', () => {
      cy.login(testUserData.validUser.registration, testUserData.validUser.password);
      
      // Fazer logout
      cy.get('[data-cy="logout-button"]').click();
      
      // Verificar limpeza
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('current_user')).to.be.null;
        expect(win.localStorage.getItem('refresh_token')).to.be.null;
      });
      
      // Redirecionado para login
      cy.url().should('include', '/login');
    });
  });

  context('Integração com Analytics', () => {
    it('deve rastrear evento de login com sucesso', () => {
      // Mock do gtag
      cy.window().then((win) => {
        win.gtag = cy.stub().as('gtag');
      });
      
      cy.login(testUserData.validUser.registration, testUserData.validUser.password);
      
      cy.get('@gtag').should('have.been.calledWith', 'event', 'login', {
        event_category: 'authentication',
        event_label: 'credentials',
        value: 1
      });
    });

    it('deve rastrear evento de login com erro', () => {
      cy.window().then((win) => {
        win.gtag = cy.stub().as('gtag');
      });
      
      cy.get('[data-cy="registration-input"]').type('wrong');
      cy.get('[data-cy="password-input"]').type('wrong');
      cy.get('[data-cy="submit-button"]').click();
      
      cy.get('@gtag').should('have.been.calledWith', 'event', 'login', {
        event_category: 'authentication',
        event_label: 'credentials',
        value: 0
      });
    });
  });
});
