/**
 * Estilos compartilhados pelas páginas dos anais, seguindo o protótipo
 * aprovado pela Comissão (cartões brancos com borda fina, títulos em verde,
 * faixa verde à esquerda nos volumes). Usa os tokens do site, então acompanha
 * o tema claro/escuro sem cores fixas.
 */
export const ANAIS_BASE_STYLES = `
  .anais-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
    margin-bottom: 1.4rem;
    box-shadow: var(--shadow-sm);
  }

  .anais-card h2 {
    color: var(--color-primary-dark);
    font-size: 1.35rem;
    margin: 0 0 0.9rem;
  }

  .anais-card h3 {
    color: var(--color-primary-dark);
    font-size: 1.05rem;
    margin: 1.3rem 0 0.4rem;
  }

  .anais-card p {
    color: var(--color-text-secondary);
    line-height: 1.7;
    margin: 0 0 0.9rem;
  }

  .anais-card p:last-child {
    margin-bottom: 0;
  }

  .anais-card.vol {
    border-left: 5px solid var(--color-primary);
  }

  .anais-kicker {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin: 0 0 0.3rem;
  }

  .anais-button {
    display: inline-block;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0.55rem 0.95rem;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-primary);
    background: var(--color-primary);
    color: var(--color-on-primary);
    text-decoration: none;
    cursor: pointer;
    margin: 0.25rem 0.35rem 0.25rem 0;
  }

  .anais-button:hover {
    background: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: var(--color-on-primary);
  }

  .anais-button.secondary {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    border-color: rgba(var(--color-primary-rgb), 0.3);
  }

  .anais-button.secondary:hover {
    background: rgba(var(--color-primary-rgb), 0.18);
  }

  .anais-button.danger {
    background: transparent;
    color: var(--color-error-text);
    border-color: rgba(var(--color-error-rgb), 0.4);
  }

  .anais-button.danger:hover {
    background: rgba(var(--color-error-rgb), 0.08);
  }

  .anais-dl {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 0.5rem 0.9rem;
    margin: 0;
  }

  .anais-dl dt {
    font-weight: 700;
    color: var(--color-text);
  }

  .anais-dl dd {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .anais-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .anais-muted {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .draft-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.15rem 0.55rem;
    border-radius: var(--border-radius-full);
    background: rgba(var(--color-warning-rgb), 0.18);
    color: var(--color-warning-text);
    vertical-align: middle;
    margin-left: 0.4rem;
  }

  @media (max-width: 800px) {
    .anais-grid {
      grid-template-columns: 1fr;
    }
    .anais-dl {
      grid-template-columns: 1fr;
      gap: 0.15rem;
    }
    .anais-dl dd {
      margin-bottom: 0.6rem;
    }
  }
`;
