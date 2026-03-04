import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 30000,
    execTimeout: 60000,
    taskTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      grepFilterSpecs: true,
      grepOmitFiltered: true,
      // Variáveis de ambiente para testes
      apiUrl: 'http://localhost:3000',
      testUser: {
        registration: '12345',
        password: '123456'
      }
    },
    setupNodeEvents(on, config) {
      // Plugins personalizados
      on('task', {
        // Task para limpar banco de dados de teste
        clearTestDatabase() {
          // Implementar limpeza do banco
          return null;
        },

        // Task para gerar dados de teste
        seedTestData() {
          // Implementar seed de dados
          return null;
        },

        // Task para verificar se o backend está online
        checkBackendHealth() {
          return cy.task('query', 'SELECT 1').then(() => true).catch(() => false);
        },

        // Task para log de performance
        logPerformance(metrics: any) {
          console.log('Performance Metrics:', metrics);
          return null;
        }
      });

      // Integrar com nx se necessário
      return nxE2EPreset(config, {
        cypressDir: 'cypress',
        bundler: 'webpack'
      });
    },
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/results',
      charts: true,
      reportPageTitle: 'DEPPI E2E Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false
    }
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack'
    }
  }
});
