import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Renderer2,
  NgZone,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Talento {
  id: string;
  nome: string;
  curso: string;
  semestre: string;
  superpoder: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  avatar_seed: string;
  foto?: string;
  turno?: string;
  disponibilidade?: string;
  idiomas?: string[];
  experiencia?: string;
  curriculo?: string;
  autorizado?: boolean;
}

const SKILL_EMOJIS: Record<string, string> = {
  // — TI & Desenvolvimento —
  python: '🐍',
  javascript: '⚡',
  typescript: '💙',
  react: '⚛️',
  angular: '🔺',
  vue: '💚',
  java: '☕',
  'c++': '⚙️',
  'c#': '🟣',
  redes: '🌐',
  linux: '🐧',
  docker: '🐳',
  git: '🔀',
  kubernetes: '☸️',
  banco: '🗄️',
  sql: '🗄️',
  design: '🎨',
  figma: '🎨',
  ux: '🖌️',
  ui: '🖌️',
  machine: '🤖',
  ia: '🤖',
  inteligência: '🤖',
  segurança: '🔐',
  cloud: '☁️',
  nodejs: '🟢',
  php: '🐘',
  flutter: '🦋',
  kotlin: '🟠',
  swift: '🍎',
  rust: '🦀',
  go: '🔵',
  devops: '🚀',
  embedded: '📟',
  arduino: '📟',
  raspberry: '📟',
  microcontrolador: '📟',
  // — Engenharia Mecânica —
  mecânica: '⚙️',
  mecanica: '⚙️',
  cad: '📐',
  solidworks: '📐',
  autocad: '📐',
  usinagem: '🔩',
  manufatura: '🏭',
  soldagem: '🔥',
  cnc: '🔩',
  termodinâmica: '🌡️',
  termodinamica: '🌡️',
  fluidos: '💧',
  materiais: '🧱',
  // — Engenharia de Controle e Automação —
  automação: '🤖',
  automacao: '🤖',
  clp: '🖥️',
  plc: '🖥️',
  scada: '🖥️',
  elétrica: '⚡',
  eletrica: '⚡',
  eletrônica: '🔌',
  eletronica: '🔌',
  instrumentação: '📡',
  instrumentacao: '📡',
  controle: '🎛️',
  robótica: '🦾',
  robotica: '🦾',
  iot: '📡',
  sensores: '📡',
  // — Engenharia Ambiental e Sanitária —
  ambiental: '🌿',
  sanitária: '🌿',
  sanitaria: '🌿',
  saneamento: '💧',
  esgoto: '💧',
  resíduos: '♻️',
  residuos: '♻️',
  reciclagem: '♻️',
  sustentabilidade: '🌱',
  meio: '🌍',
  geotécnica: '🗺️',
  geotecnica: '🗺️',
  geoprocessamento: '🗺️',
  sig: '🗺️',
  gis: '🗺️',
  hidráulica: '💧',
  hidraulica: '💧',
  qualidade: '🧪',
  impacto: '🌍',
  // — Química —
  química: '🧪',
  quimica: '🧪',
  laboratório: '🔬',
  laboratorio: '🔬',
  análise: '🔬',
  analise: '🔬',
  cromatografia: '🧬',
  síntese: '⚗️',
  sintese: '⚗️',
  reação: '⚗️',
  reacao: '⚗️',
  orgânica: '🧬',
  organica: '🧬',
  inorgânica: '⚗️',
  inorganica: '⚗️',
  bioquímica: '🧬',
  bioquimica: '🧬',
  analítica: '🔬',
  analitica: '🔬',
  // — Matemática & Ciências —
  matemática: '📐',
  matematica: '📐',
  cálculo: '🧮',
  calculo: '🧮',
  álgebra: '🔢',
  algebra: '🔢',
  estatística: '📊',
  estatistica: '📊',
  probabilidade: '🎲',
  modelagem: '📊',
  simulação: '💻',
  simulacao: '💻',
  // — Habilidades Transversais —
  liderança: '👑',
  lideranca: '👑',
  gestão: '📋',
  gestao: '📋',
  projetos: '📋',
  scrum: '🔄',
  ágil: '🔄',
  agil: '🔄',
  pesquisa: '🔍',
  extensão: '🤝',
  extensao: '🤝',
  ensino: '📚',
  excel: '📊',
  power: '📊',
  office: '📊',
  comunicação: '🗣️',
  comunicacao: '🗣️',
  inglês: '🌎',
  ingles: '🌎',
  espanhol: '🌍',
};

function getSkillEmoji(skill: string): string {
  const lower = skill.toLowerCase();
  for (const key of Object.keys(SKILL_EMOJIS)) {
    if (lower.includes(key)) return SKILL_EMOJIS[key];
  }
  return '🎯';
}

function diceBearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=12`;
}

@Component({
  standalone: false,
  selector: 'app-talentos',
  template: `
    <main class="hub-container">
      <!-- Hero -->
      <section class="hub-hero">
        <div class="hero-badge">✨ IFCE MARACANAÚ</div>
        <h1 class="hero-title">
          Hub de<br />
          <span class="hero-accent">Talentos</span> 🚀
        </h1>
        <p class="hero-sub">
          De Computação à Engenharia, de Química à Matemática — conheça os
          estudantes e futuros profissionais do IFCE Maracanaú. Cada card é uma
          história. Cada habilidade é um superpoder.
        </p>
        <div class="hero-stats">
          <div class="stat-pill">🎓 {{ talentos.length }} talentos</div>
          <div class="stat-pill">🌍 Todos os cursos</div>
          <div class="stat-pill">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
              style="margin-right: 4px; vertical-align: -2px;"
            >
              <path d="M13 2L3 14h7v8l10-12h-7V2z" />
            </svg>
            Prontos pro mercado
          </div>
        </div>
      </section>

      <!-- Search + Filter -->
      <section class="controls-bar">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            class="search-input"
            type="text"
            placeholder="Buscar por nome, curso ou skill..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
          />
        </div>
        <div class="filter-chips">
          <button
            class="chip"
            [class.active]="activeCourse === ''"
            (click)="setCourse('')"
          >
            Todos
          </button>
          <button
            *ngFor="let curso of cursos"
            class="chip"
            [class.active]="activeCourse === curso"
            (click)="setCourse(curso)"
          >
            {{ curso }}
          </button>
        </div>
      </section>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando talentos...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        <span class="empty-emoji">🫙</span>
        <p>Nenhum talento encontrado com esses filtros.</p>
      </div>

      <!-- Cards grid -->
      <section class="cards-grid" *ngIf="!loading && filtered.length > 0">
        <div
          class="talent-card"
          *ngFor="let t of filtered; let i = index"
          [style.animation-delay]="i * 60 + 'ms'"
          (click)="openCard(t)"
          (touchstart)="onSwipeStart($event, t)"
          (touchmove)="onSwipeMove($event)"
          (touchend)="onSwipeEnd($event)"
          (mousedown)="onSwipeStart($event, t)"
          [class.flipped]="flippedId === t.id"
          [class.blurred-card]="t.autorizado === false"
          tabindex="0"
          (keydown.enter)="openCard(t)"
          [attr.aria-label]="'Ver perfil de ' + t.nome"
        >
          <!-- Overlay CONTATAR (swipe direita) -->
          <div
            class="swipe-overlay swipe-yes"
            [style.opacity]="
              swipingCardId === t.id && swipeDelta > 0 ? swipeDelta / 120 : 0
            "
          >
            <span>🤝 CONTATAR</span>
          </div>
          <!-- Overlay PASSAR (swipe esquerda) -->
          <div
            class="swipe-overlay swipe-no"
            [style.opacity]="
              swipingCardId === t.id && swipeDelta < 0 ? -swipeDelta / 120 : 0
            "
          >
            <span>↩ PASSAR</span>
          </div>
          <!-- Front -->
          <div class="card-face card-front">
            <div class="card-header-stripe"></div>
            <img
              class="card-avatar"
              draggable="false"
              [style.transform]="
                t.nome.includes('Mariana') ? 'rotate(180deg)' : 'none'
              "
              [src]="t.foto ? t.foto : diceBearUrl(t.avatar_seed)"
              (error)="handleImageError($event, t)"
              [alt]="'Avatar de ' + t.nome"
            />
            <div class="card-body">
              <h3 class="card-name">{{ t.nome }}</h3>
              <span class="card-course">{{ t.curso }} · {{ t.semestre }}</span>
              <div
                class="market-badge"
                *ngIf="t.experiencia && t.experiencia.includes('Sim')"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="12"
                  height="12"
                  style="margin-right: 2px; vertical-align: -1px;"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7V2z" />
                </svg>
                Pronto pro mercado
              </div>
              <div class="card-power">
                <span class="power-label">SUPERPODER</span>
                <span class="power-value">{{ t.superpoder }}</span>
              </div>
              <p class="card-bio">{{ t.bio }}</p>
            </div>
            <div class="card-tap-hint">
              <span class="hint-swipe">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                </svg>
                arrastar para contatar
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12h14M14 5l7 7-7 7" />
                </svg>
              </span>
              <span class="hint-tap">toque para ver skills ↗</span>
            </div>
          </div>

          <!-- Back -->
          <div class="card-face card-back">
            <h3 class="back-name">{{ t.nome }}</h3>

            <div class="card-details-scroll">
              <div class="skills-cloud">
                <span class="skill-tag" *ngFor="let skill of t.skills"
                  >{{ getEmoji(skill) }} {{ skill }}</span
                >
                <span
                  *ngIf="!t.skills || t.skills.length === 0"
                  class="skill-tag"
                  >💻 {{ t.superpoder }}</span
                >
              </div>

              <div class="detail-item" *ngIf="t.turno">
                <span class="detail-label">Turno:</span> {{ t.turno }}
              </div>
              <div class="detail-item" *ngIf="t.disponibilidade">
                <span class="detail-label">Disponibilidade:</span>
                {{ t.disponibilidade }}
              </div>
              <div class="detail-item" *ngIf="t.experiencia">
                <span class="detail-label">Experiência:</span>
                {{ t.experiencia }}
              </div>
              <div
                class="detail-item"
                *ngIf="t.idiomas && t.idiomas.length > 0"
              >
                <span class="detail-label">Idiomas:</span>
                {{ t.idiomas.join(', ') }}
              </div>
            </div>

            <div class="card-links">
              <a
                *ngIf="t.curriculo"
                [href]="t.curriculo"
                target="_blank"
                rel="noopener noreferrer"
                class="link-btn cv-btn"
                (click)="$event.stopPropagation()"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                  />
                </svg>
                CV
              </a>
              <a
                *ngIf="t.github"
                [href]="t.github"
                target="_blank"
                rel="noopener noreferrer"
                class="link-btn github-btn"
                (click)="$event.stopPropagation()"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  />
                </svg>
                GitHub
              </a>
              <a
                *ngIf="t.linkedin"
                [href]="t.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="link-btn linkedin-btn"
                (click)="$event.stopPropagation()"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
                LinkedIn
              </a>
            </div>
            <div class="card-tap-hint">toque para voltar ↙</div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="cta-card">
          <span class="cta-emoji">🌟</span>
          <div class="cta-text">
            <h2>Quer aparecer aqui?</h2>
            <p>Preencha o formulário e faça parte do nosso Hub de Talentos!</p>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeV65-31I3c6NXb_G5pumQaNtdqK1M8YiP4byJSz1auhQEoFg/viewform?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn"
          >
            Me candidatar →
          </a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* ─── Reset / Base ─────────────────────────────── */
      .hub-container {
        min-height: 100vh;
        padding-top: 100px;
        padding-bottom: 80px;
        background: #f5f0e8;
        font-family: 'Inter', 'Segoe UI', sans-serif;
      }

      /* ─── Hero ──────────────────────────────────────── */
      .hub-hero {
        text-align: center;
        padding: 3rem 1.5rem 2rem;
        max-width: 700px;
        margin: 0 auto;
      }
      .hero-badge {
        display: inline-block;
        background: #1a1a1a;
        color: #f5f0e8;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 0.35rem 0.9rem;
        border-radius: 2px;
        margin-bottom: 1.5rem;
        border: 2px solid #1a1a1a;
      }
      .hero-title {
        font-size: clamp(2.8rem, 8vw, 5rem);
        font-weight: 900;
        color: #1a1a1a;
        line-height: 1.05;
        margin: 0 0 1rem;
        letter-spacing: -2px;
      }
      .hero-accent {
        color: #f5f0e8;
        background: #1a1a1a;
        padding: 0 0.15em;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }
      .hero-sub {
        font-size: 1.05rem;
        color: #444;
        line-height: 1.7;
        margin: 0 0 2rem;
      }
      .hero-stats {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .stat-pill {
        background: #fff;
        border: 2.5px solid #1a1a1a;
        box-shadow: 3px 3px 0 #1a1a1a;
        border-radius: 100px;
        padding: 0.4rem 1rem;
        font-size: 0.88rem;
        font-weight: 700;
        color: #1a1a1a;
      }

      /* ─── Controls ───────────────────────────────────── */
      .controls-bar {
        max-width: 1100px;
        margin: 0 auto 2rem;
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .search-wrapper {
        display: flex;
        align-items: center;
        background: #fff;
        border: 2.5px solid #1a1a1a;
        box-shadow: 4px 4px 0 #1a1a1a;
        border-radius: 8px;
        padding: 0 1rem;
        gap: 0.5rem;
      }
      .search-icon {
        font-size: 1.1rem;
      }
      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 1rem;
        padding: 0.75rem 0;
        background: transparent;
        color: #1a1a1a;
        font-family: inherit;
      }
      .search-input::placeholder {
        color: #999;
      }

      .filter-chips {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      .chip {
        background: #fff;
        border: 2px solid #1a1a1a;
        box-shadow: 2px 2px 0 #1a1a1a;
        border-radius: 100px;
        padding: 0.3rem 0.9rem;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.1s;
        font-family: inherit;
        color: #1a1a1a;
      }
      .chip:hover,
      .chip.active {
        background: #1a1a1a;
        color: #f5f0e8;
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0 #f5c842;
      }

      /* ─── States ─────────────────────────────────────── */
      .loading-state {
        text-align: center;
        padding: 4rem;
        color: #666;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #ddd;
        border-top-color: #1a1a1a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .empty-state {
        text-align: center;
        padding: 4rem;
        color: #666;
        font-size: 1.1rem;
      }
      .empty-emoji {
        font-size: 3rem;
        display: block;
        margin-bottom: 1rem;
      }

      /* ─── Cards Grid ─────────────────────────────────── */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;
      }

      /* ─── Flip Card ──────────────────────────────────── */
      .talent-card {
        position: relative;
        height: 380px;
        perspective: 1000px;
        cursor: pointer;
        opacity: 0;
        animation: fadeUp 0.5s ease forwards;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
      }

      /* ─── Swipe Overlays (estilo Tinder) ─────────────── */
      .swipe-overlay {
        position: absolute;
        inset: 0;
        z-index: 20;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transition: opacity 0.05s linear;
      }
      .swipe-overlay span {
        font-size: 1.4rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        padding: 0.5rem 1.2rem;
        border-radius: 12px;
        border: 3px solid currentColor;
        text-transform: uppercase;
      }
      .swipe-yes {
        background: rgba(34, 197, 94, 0.18);
        color: #16a34a;
      }
      .swipe-yes span {
        transform: rotate(-15deg);
        color: #16a34a;
        border-color: #16a34a;
      }
      .swipe-no {
        background: rgba(107, 114, 128, 0.15);
        color: #4b5563;
      }
      .swipe-no span {
        transform: rotate(15deg);
        color: #4b5563;
        border-color: #4b5563;
      }
      .talent-card.blurred-card .card-face {
        filter: blur(6px) grayscale(50%);
        pointer-events: none;
        user-select: none;
      }
      .talent-card.blurred-card::after {
        content: 'Apenas Uso Interno';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 800;
        font-size: 0.85rem;
        z-index: 10;
        box-shadow: 4px 4px 0 #f5c842;
        pointer-events: none;
        text-align: center;
      }
      .talent-card:not(.blurred-card):hover {
        transform: translateY(-8px);
      }
      .talent-card:not(.blurred-card):hover .card-front {
        box-shadow: 12px 12px 0 rgba(0, 0, 0, 0.15);
      }
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      /* Hover lifts the wrapper — independent of the face rotations */
      .talent-card.flipped .card-front {
        transform: rotateY(-180deg);
      }
      .talent-card.flipped .card-back {
        transform: rotateY(0deg);
      }

      .card-face {
        position: absolute;
        inset: 0;
        border: 2.5px solid #1a1a1a;
        border-radius: 12px;
        background: #fff;
        box-shadow: 4px 4px 0 #1a1a1a;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transition:
          transform 0.5s ease,
          box-shadow 0.15s;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .card-front {
        transform: rotateY(0deg);
      }
      .card-back {
        transform: rotateY(180deg);
        background: #1a1a1a;
        color: #f5f0e8;
        padding: 1.5rem;
        justify-content: center;
      }

      /* stripes de cor no topo — neo-brutalism */
      .card-header-stripe {
        height: 8px;
        background: repeating-linear-gradient(
          90deg,
          #f5c842 0px,
          #f5c842 20px,
          #ff6b6b 20px,
          #ff6b6b 40px,
          #4ecdc4 40px,
          #4ecdc4 60px,
          #a29bfe 60px,
          #a29bfe 80px
        );
        flex-shrink: 0;
      }

      .card-avatar {
        width: 80px;
        height: 80px;
        border: 2.5px solid #1a1a1a;
        border-radius: 10px;
        margin: 1rem auto 0;
        display: block;
        background: #f0e8d8;
        object-fit: cover;
      }
      .card-body {
        padding: 0.75rem 1.25rem;
        flex: 1;
      }
      .card-name {
        font-size: 1.15rem;
        font-weight: 900;
        color: #1a1a1a;
        margin: 0 0 0.2rem;
        letter-spacing: -0.5px;
      }
      .card-course {
        font-size: 0.78rem;
        color: #666;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
      }
      .market-badge {
        display: inline-block;
        background: #f5c842;
        color: #1a1a1a;
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 0.2rem 0.5rem;
        border: 2px solid #1a1a1a;
        border-radius: 4px;
        box-shadow: 2px 2px 0 #1a1a1a;
        margin-top: 0.5rem;
      }
      .card-power {
        margin: 0.75rem 0;
        background: #f5f0e8;
        border: 2px solid #1a1a1a;
        border-radius: 6px;
        padding: 0.4rem 0.7rem;
        display: flex;
        flex-direction: column;
      }
      .power-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #888;
        text-transform: uppercase;
      }
      .power-value {
        font-size: 0.92rem;
        font-weight: 700;
        color: #1a1a1a;
      }
      .card-bio {
        font-size: 0.85rem;
        color: #444;
        line-height: 1.5;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .card-tap-hint {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        padding: 0.5rem 0.25rem 0.25rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        margin-top: 0.5rem;
      }
      .hint-swipe {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #16a34a;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .hint-swipe svg {
        animation: swipe-pulse 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }
      .hint-swipe svg:first-child {
        animation-direction: reverse;
      }
      @keyframes swipe-pulse {
        0%,
        100% {
          transform: translateX(0);
          opacity: 0.5;
        }
        50% {
          transform: translateX(4px);
          opacity: 1;
        }
      }
      .hint-tap {
        font-size: 0.65rem;
        color: #aaa;
        font-weight: 600;
      }

      /* Back side */
      .back-name {
        font-size: 1.2rem;
        font-weight: 900;
        color: #f5c842;
        margin: 0 0 1rem;
        letter-spacing: -0.5px;
      }
      .skills-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
        flex: 1;
        align-content: flex-start;
        margin-bottom: 0.8rem;
      }
      .skill-tag {
        background: rgba(255, 255, 255, 0.1);
        border: 1.5px solid rgba(255, 255, 255, 0.25);
        color: #f5f0e8;
        border-radius: 100px;
        padding: 0.25rem 0.65rem;
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .card-details-scroll {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 1rem;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.85);
        padding-right: 0.5rem;
      }
      .card-details-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .card-details-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }
      .detail-item {
        margin-bottom: 0.5rem;
        line-height: 1.3;
      }
      .detail-label {
        font-weight: 700;
        color: #f5c842;
        text-transform: uppercase;
        font-size: 0.7rem;
        display: block;
      }

      .card-links {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }
      .link-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.85rem;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        text-decoration: none;
        transition:
          opacity 0.15s,
          transform 0.15s;
        border: 2px solid transparent;
      }
      .link-btn:hover {
        opacity: 0.85;
        transform: scale(0.97);
      }
      .contact-btn {
        flex: 1 1 100%;
        background-color: #5746e3;
        color: #fff;
        font-size: 0.9rem;
        padding: 0.6rem 0.85rem;
        border: 2px solid #1a1a1a;
        box-shadow: 2px 2px 0px #1a1a1a;
        justify-content: center;
        margin-bottom: 0.5rem;
      }
      .contact-btn:hover {
        background-color: #4a3bc2;
        transform: translate(-2px, -2px) !important;
        box-shadow: 4px 4px 0px #1a1a1a;
        opacity: 1 !important;
      }
      :host-context([data-theme='dark']) .contact-btn {
        background-color: #7b6ae0;
        border: 2px solid #fff;
        box-shadow: 2px 2px 0px #fff;
      }
      :host-context([data-theme='dark']) .contact-btn:hover {
        box-shadow: 4px 4px 0px #fff;
      }
      .github-btn {
        background: #f5f0e8;
        color: #1a1a1a;
      }
      .linkedin-btn {
        background: #0077b5;
        color: #fff;
      }
      .cv-btn {
        background: #ff5e5e;
        color: #fff;
        border-color: #1a1a1a;
      }

      /* ─── CTA ────────────────────────────────────────── */
      .cta-section {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      .cta-card {
        background: #f5c842;
        border: 2.5px solid #1a1a1a;
        box-shadow: 6px 6px 0 #1a1a1a;
        border-radius: 12px;
        padding: 2rem 2.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .cta-emoji {
        font-size: 2.5rem;
        flex-shrink: 0;
      }
      .cta-text {
        flex: 1;
        min-width: 200px;
      }
      .cta-text h2 {
        font-size: 1.4rem;
        font-weight: 900;
        color: #1a1a1a;
        margin: 0 0 0.3rem;
      }
      .cta-text p {
        font-size: 0.9rem;
        color: #333;
        margin: 0;
      }
      .cta-btn {
        background: #1a1a1a;
        color: #f5c842;
        border: 2px solid #1a1a1a;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 800;
        text-decoration: none;
        white-space: nowrap;
        transition:
          transform 0.1s,
          box-shadow 0.1s;
        box-shadow: 3px 3px 0 #444;
      }
      .cta-btn:hover {
        transform: translate(-2px, -2px);
        box-shadow: 5px 5px 0 #444;
      }

      /* ─── Responsive ─────────────────────────────────── */
      @media (max-width: 600px) {
        .cards-grid {
          grid-template-columns: 1fr;
        }
        .cta-card {
          flex-direction: column;
          text-align: center;
        }
        .hero-title {
          letter-spacing: -1px;
        }
      }

      /* ─── Dark Mode ──────────────────────────────────── */
      :host-context([data-theme='dark']) .hub-container {
        background: var(--color-background);
      }
      :host-context([data-theme='dark']) .hero-title,
      :host-context([data-theme='dark']) .card-name,
      :host-context([data-theme='dark']) .power-value {
        color: var(--color-text);
      }
      :host-context([data-theme='dark']) .hero-sub,
      :host-context([data-theme='dark']) .card-course,
      :host-context([data-theme='dark']) .card-bio,
      :host-context([data-theme='dark']) .loading-state,
      :host-context([data-theme='dark']) .empty-state {
        color: var(--color-text-secondary);
      }
      :host-context([data-theme='dark']) .hero-accent {
        color: var(--color-background);
        background: var(--color-text);
      }
      :host-context([data-theme='dark']) .hero-badge {
        background: var(--color-text);
        color: var(--color-background);
        border-color: var(--color-text);
      }
      :host-context([data-theme='dark']) .stat-pill,
      :host-context([data-theme='dark']) .search-wrapper,
      :host-context([data-theme='dark']) .chip,
      :host-context([data-theme='dark']) .card-face.card-front,
      :host-context([data-theme='dark']) .card-power {
        background: var(--color-surface);
        border-color: var(--color-border);
        color: var(--color-text);
      }
      :host-context([data-theme='dark']) .search-input {
        color: var(--color-text);
      }
      :host-context([data-theme='dark']) .stat-pill,
      :host-context([data-theme='dark']) .search-wrapper {
        box-shadow: 3px 3px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .card-face {
        box-shadow: 4px 4px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .chip:hover,
      :host-context([data-theme='dark']) .chip.active {
        background: var(--color-text);
        color: var(--color-background);
        box-shadow: 3px 3px 0 #f5c842;
        border-color: var(--color-text);
      }
      :host-context([data-theme='dark']) .card-face.card-back {
        background: var(--color-surface-secondary);
        border-color: var(--color-border);
        box-shadow: 4px 4px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .market-badge {
        box-shadow: 2px 2px 0 var(--color-border);
        border-color: var(--color-border);
      }
      :host-context([data-theme='dark']) .card-avatar {
        background: var(--color-background);
        border-color: var(--color-border);
      }
      :host-context([data-theme='dark']) .power-label,
      :host-context([data-theme='dark']) .card-tap-hint {
        color: var(--color-text-secondary);
      }
      :host-context([data-theme='dark'])
        .talent-card:not(.blurred-card):hover
        .card-front {
        box-shadow: 8px 8px 0 rgba(255, 255, 255, 0.15);
      }
      :host-context([data-theme='dark']) .cta-card {
        border-color: var(--color-border);
        box-shadow: 6px 6px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .cta-btn {
        background: var(--color-text);
        color: var(--color-background);
        border-color: var(--color-border);
        box-shadow: 3px 3px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .github-btn {
        background: var(--color-surface);
        color: var(--color-text);
        border-color: var(--color-border);
      }
      :host-context([data-theme='dark']) .talent-card.blurred-card::after {
        box-shadow: 4px 4px 0 var(--color-border);
      }
      :host-context([data-theme='dark']) .cta-text h2 {
        color: #1a1a1a;
      }
    `,
  ],
})
export class TalentosComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly renderer = inject(Renderer2);
  private readonly ngZone = inject(NgZone);

  talentos: Talento[] = [];
  filtered: Talento[] = [];
  cursos: string[] = [];
  searchQuery = '';
  activeCourse = '';
  loading = true;
  flippedId: string | null = null;

  swipeStartX = 0;
  swipeStartY = 0;
  swipeActive = false;
  swipeDelta = 0; // delta X atual do arraste (-120 a +120 para opacidade)
  swipingCardId: string | null = null; // ID do card sendo arrastado
  isSwiping = false;
  activeCardEl: HTMLElement | null = null;
  private pendingTalento: any = null;

  // Listeners globais de mouse (removidos após o drag)
  private mouseMoveUnsub: (() => void) | null = null;
  private mouseUpUnsub: (() => void) | null = null;

  readonly diceBearUrl = diceBearUrl;
  readonly getEmoji = getSkillEmoji;

  loadTalentos(): void {
    this.loading = true;
    this.http.get<Talento[]>('assets/data/talentos.json').subscribe({
      next: (data) => {
        this.talentos = data;
        this.cursos = [...new Set(data.map((t) => t.curso))].sort();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar talentos do JSON', err);
        this.loading = false;
      },
    });
  }

  ngOnInit(): void {
    this.loadTalentos();
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.talentos.filter((t) => {
      const matchesCourse = !this.activeCourse || t.curso === this.activeCourse;
      const matchesQuery =
        !q ||
        t.nome.toLowerCase().includes(q) ||
        t.curso.toLowerCase().includes(q) ||
        t.superpoder.toLowerCase().includes(q) ||
        t.skills.some((s) => s.toLowerCase().includes(q));
      return matchesCourse && matchesQuery;
    });
  }

  setCourse(curso: string): void {
    this.activeCourse = curso;
    this.applyFilters();
  }

  openCard(t: Talento): void {
    if (this.isSwiping) {
      this.isSwiping = false;
      return;
    }
    this.flippedId = this.flippedId === t.id ? null : t.id;
  }

  private getClientX(event: any): number {
    if (event.touches?.length > 0) return event.touches[0].clientX;
    if (event.changedTouches?.length > 0)
      return event.changedTouches[0].clientX;
    return event.clientX ?? 0;
  }

  private getClientY(event: any): number {
    if (event.touches?.length > 0) return event.touches[0].clientY;
    if (event.changedTouches?.length > 0)
      return event.changedTouches[0].clientY;
    return event.clientY ?? 0;
  }

  ngOnDestroy(): void {
    this.removeMouseListeners();
  }

  private removeMouseListeners(): void {
    if (this.mouseMoveUnsub) {
      this.mouseMoveUnsub();
      this.mouseMoveUnsub = null;
    }
    if (this.mouseUpUnsub) {
      this.mouseUpUnsub();
      this.mouseUpUnsub = null;
    }
  }

  onSwipeStart(event: any, talento?: Talento): void {
    this.isSwiping = false;
    this.swipeActive = true;
    this.swipeDelta = 0;
    this.swipeStartX = this.getClientX(event);
    this.swipeStartY = this.getClientY(event);
    this.activeCardEl = event.currentTarget as HTMLElement;

    if (talento) {
      this.pendingTalento = talento;
      this.swipingCardId = talento.id;
    }

    if (this.activeCardEl) {
      this.activeCardEl.style.transition = 'none';
    }

    // Para mouse: registra listeners no document FORA da zona (performance)
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.ngZone.runOutsideAngular(() => {
        this.mouseMoveUnsub = this.renderer.listen(
          'document',
          'mousemove',
          (e) => this.onSwipeMove(e)
        );
        this.mouseUpUnsub = this.renderer.listen('document', 'mouseup', (e) =>
          this.onSwipeEnd(e)
        );
      });
    }
  }

  onSwipeMove(event: any): void {
    if (!this.swipeActive || !this.activeCardEl) return;

    const currentX = this.getClientX(event);
    const deltaX = currentX - this.swipeStartX;

    // Feedback DOM direto (rápido, sem change detection)
    const rotation = deltaX * 0.05;
    this.activeCardEl.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

    // Força change detection para os overlays reagirem
    this.ngZone.run(() => {
      this.swipeDelta = deltaX;
    });
  }

  onSwipeCancelled(): void {
    if (this.activeCardEl) {
      this.activeCardEl.style.transition =
        'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      this.activeCardEl.style.transform = '';
    }
    this.activeCardEl = null;
    this.swipeActive = false;
    this.swipeDelta = 0;
    this.swipingCardId = null;
    this.removeMouseListeners();
  }

  onSwipeEnd(event: any): void {
    if (!this.swipeActive) return;

    const endX = this.getClientX(event);
    const endY = this.getClientY(event);
    const deltaX = endX - this.swipeStartX;
    const deltaY = endY - this.swipeStartY;
    const t = this.pendingTalento;
    this.pendingTalento = null;

    this.removeMouseListeners();
    this.swipeActive = false;

    // Swipe confirmado: anima para fora da tela (estilo Tinder) depois abre o form
    if (t && deltaX >= 40 && Math.abs(deltaY) < 80) {
      // Swipe para DIREITA → CONTATAR
      this.isSwiping = true;
      const elem = this.activeCardEl;

      if (elem) {
        // Voa para fora da tela (direita)
        elem.style.transition =
          'transform 0.45s cubic-bezier(0.6, 0, 1, 1), opacity 0.45s ease';
        elem.style.transform = `translateX(120vw) rotate(30deg)`;
        elem.style.opacity = '0';

        setTimeout(() => {
          if (elem) {
            elem.style.transition = 'none';
            elem.style.transform = '';
            elem.style.opacity = '';
          }
          this.swipeDelta = 0;
          this.swipingCardId = null;
          this.activeCardEl = null;
          window.open(this.getContactUrl(t), '_blank');
        }, 460);
      } else {
        this.swipeDelta = 0;
        this.swipingCardId = null;
        this.activeCardEl = null;
        window.open(this.getContactUrl(t), '_blank');
      }
    } else if (t && deltaX <= -40 && Math.abs(deltaY) < 80) {
      // Swipe para ESQUERDA → PASSAR (descarta sem ação)
      this.isSwiping = true;
      const elem = this.activeCardEl;
      if (elem) {
        elem.style.transition =
          'transform 0.45s cubic-bezier(0.6, 0, 1, 1), opacity 0.45s ease';
        elem.style.transform = `translateX(-120vw) rotate(-30deg)`;
        elem.style.opacity = '0';
        setTimeout(() => {
          if (elem) {
            elem.style.transition = 'none';
            elem.style.transform = '';
            elem.style.opacity = '';
          }
          this.swipeDelta = 0;
          this.swipingCardId = null;
          this.activeCardEl = null;
        }, 460);
      } else {
        this.swipeDelta = 0;
        this.swipingCardId = null;
        this.activeCardEl = null;
      }
    } else {
      // Não atingiu threshold: volta pro lugar
      this.onSwipeCancelled();
    }
  }

  handleImageError(event: any, t: Talento): void {
    // Se a imagem do Google Drive falhar (ex: erro 403), usa o fallback do DiceBear
    event.target.src = this.diceBearUrl(t.avatar_seed);
  }

  getContactUrl(t: Talento): string {
    const baseUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLSeqO9TJy11NAZYZKn1GasC07wff8551yds2-ue-gz26TogY-g/viewform';
    const params = new URLSearchParams();
    params.set('usp', 'pp_url');
    // Preenche com o nome e ID do talento (ex: Mariana Silva de Holanda (9ab0a068))
    params.set('entry.100655529', `${t.nome} (${t.id.substring(0, 8)})`);

    return `${baseUrl}?${params.toString()}`;
  }
}

const routes: Routes = [{ path: '', component: TalentosComponent }];

@NgModule({
  declarations: [TalentosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    FormsModule,
    SharedModule,
  ],
})
export class TalentosModule {}
