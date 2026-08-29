# Skill: Auditoria de Segurança DEPPI (5 categorias + relatório PDF)

> Reproduz, sob demanda, a auditoria de segurança do repositório `deppi_novo`
> focada em **Isolamento, Permissões Frontend vs Backend, IDOR, Chaves
> Expostas e XSS**, e regenera `docs/security-audit/relatorio-auditoria-seguranca.pdf`
> com a mesma estrutura, paleta de cores e nível de profundidade sempre que o
> usuário pedir (ex.: "rode a auditoria de segurança de novo", "atualize o
> relatório de segurança", "audita o repo com a skill audit-security").

Esta skill documenta um processo, não apenas um script: o script
(`docs/security-audit/generate_report.py`) só formata em PDF os achados que
já existem em `docs/security-audit/findings-data.json`. Repetir a auditoria
significa **primeiro revisitar o código com os critérios abaixo** (algo pode
ter sido corrigido, algo novo pode ter sido introduzido) e só então
atualizar o JSON e regerar o PDF.

## Ao ser invocada, o agente deve

1. **Reconhecer a stack de novo, não assumir a anterior.** Ler `package.json`
   (raiz e `backend/`), `docker-compose.yml`, `.env.example`, `Dockerfile`,
   `README.md`/`README_ARQUITETURA.md`. Preencher/atualizar
   `meta.stack` em `findings-data.json` com o que for encontrado *hoje* —
   não copiar cegamente a tabela de uma execução anterior. Na última
   execução (2026-08-29) a stack era: Angular 20/21 (frontend), Node/Express
   + TypeScript + Knex/PostgreSQL (backend), Redis, Docker Compose + Nginx,
   um módulo legado PHP (`cargahoraria/`, mPDF) e um script Python
   (`bin/sync_talentos.py`). Nada de Supabase/Firebase/Flutter neste
   projeto — não presuma essas tecnologias só porque aparecem em prompts
   genéricos de auditoria.
2. **Remapear as 5 categorias para a stack encontrada** (registrar em
   `meta.category_mapping`), porque o significado de cada categoria muda
   conforme a arquitetura:
   - **Isolamento**: sem multi-tenant SaaS aqui — interpretar como (a)
     RBAC real entre papéis de usuário, não só "logado ou não"; (b)
     segredos separados por finalidade (ex.: JWT de acesso vs refresh); (c)
     isolamento entre recursos de negócio (um laboratório/registro não deve
     ser controlável por qualquer usuário como se fosse o dono); (d)
     isolamento de rede/processo em Docker (usuário non-root, portas
     expostas, segmentação de rede).
   - **Permissões Frontend vs Backend**: para cada guard/rota protegida no
     Angular (`src/app/core/guards/*.ts`), existe o middleware equivalente
     (`authMiddleware` **e** `authorizeRoles(...)`) na rota Express
     correspondente? Backend é a fonte da verdade; frontend é só UX.
   - **IDOR**: para cada rota com `:id`/`:algumId`, o handler confirma que
     `req.user` tem relação legítima com aquele registro específico antes
     de ler/escrever, em vez de só verificar "existe JWT válido"?
   - **Chaves Expostas**: sem chaves de API tipo Supabase anon-key aqui —
     focar em segredos hardcoded em código versionado (seeds, Dockerfile,
     docker-compose.yml), fallback inseguro de env vars, e se `.env` real
     já foi commitado (`git log --all --diff-filter=A --name-only | grep
     '\.env$'`).
   - **XSS**: Angular sanitiza `[innerHTML]` por padrão — procurar
     especificamente por `bypassSecurityTrustHtml`/`bypassSecurityTrust*`
     (desativa a proteção) e conferir se o valor passado vem de conteúdo
     gerado por usuário (editor rico, campo de formulário) sem sanitização
     nem no client (DOMPurify) nem no servidor antes de persistir. Módulos
     PHP legados: procurar interpolação direta de `$_GET`/`$_POST`/`$_REQUEST`
     em HTML sem `htmlspecialchars`.
3. **Varrer arquivo por arquivo** — não é permitido registrar um achado sem
   ter lido a linha real. Sequência recomendada (repita para cada categoria):
   - `Grep`/`grep -rn` por padrões-chave (`authorizeRoles`, `innerHTML`,
     `bypassSecurityTrust`, `localStorage`, `\.where\(\{ id \}\)`,
     `process.env`, `PASSWORD`, `SECRET`) em `backend/src` e `src/app`.
   - Ler cada `*.routes.ts` inteiro e conferir literalmente quais
     middlewares estão em cada linha de rota.
   - Ler os `*.controller.ts` correspondentes para ver se há checagem de
     posse/papel dentro do handler (não só no router).
   - Ler as migrations (`backend/src/database/migrations/*.ts`) para saber
     se um ID é `uuid` (difícil de adivinhar) ou `increments` (sequencial,
     fácil de enumerar) — isso muda a severidade de um achado de IDOR.
   - `git ls-files | grep -i env` e `git log --all --diff-filter=A
     --name-only | grep '\.env$'` para confirmar se segredos reais vazaram
     no histórico.
   - Documentar **também os pontos fortes** (`"type": "strength"`) sempre
     que um padrão correto for confirmado lendo o código — não é
     opcional, o relatório perde credibilidade sem contraponto.
4. **Registrar cada achado em `docs/security-audit/findings-data.json`**
   (ver *Schema de achado* abaixo) com `file`/`lines` exatos — se um achado
   cobre vários arquivos, separar por `;` em `file` e, em `lines`, usar
   `"NomeCurtoDoArquivo:linhas"` por trecho (ex.:
   `"Dockerfile:58; environment.ts:9-15"`) para o script conseguir montar a
   tabela resumo sem ambiguidade (ver `first_file_line()` no script).
5. **Regenerar o PDF** (ver *Como rodar* abaixo).
6. **Resumir no chat, arquivo por arquivo**, os achados novos/alterados
   desde a última auditoria (não repita o relatório inteiro se pouca coisa
   mudou — destaque o diff de postura de segurança).

## Schema de achado (`findings-data.json` → array `findings`)

```jsonc
{
  "id": "XSS-1",                 // PREFIXO da categoria (ISO/PERM/IDOR/KEY/XSS) + número; "-S" antes do número = ponto forte (ex.: "ISO-S1")
  "category": "XSS",             // exatamente uma das 5 strings em meta.categories
  "severity": "Crítico",         // Crítico | Alto | Médio | Baixo | Informativo (Informativo = reservado a "strength")
  "type": "weakness",            // "weakness" ou "strength"
  "title": "...",
  "file": "caminho/a.ts; caminho/b.ts",   // 1+ arquivos, separados por ';'
  "lines": "12-13, 45; NomeCurto.ts:20",  // mesmo nº de segmentos ';' que 'file', na mesma ordem
  "evidence": "trecho de código REAL copiado do arquivo",  // vai para um bloco <pre> — não precisa escapar < > &, mas EVITE linhas > 95 colunas (Preformatted não quebra linha sozinho)
  "description": "o que está errado/certo, citando a mecânica exata",
  "impact": "o que um atacante ganharia / por que isso importa",
  "recommendation": "ação concreta e específica, não genérica"
}
```

Critério de severidade (reaplicar sempre, não inventar um novo por execução):

| Severidade | Critério |
|---|---|
| Crítico | Compromete confidencialidade/integridade de todo o sistema ou de muitas contas, baixo esforço, sem pré-condição especial. |
| Alto | Impacto sério, mas depende de uma pré-condição razoável ou atinge um subconjunto relevante. |
| Médio | Falha real, raio de impacto limitado ou condição menos provável. |
| Baixo | Reforço de defesa em profundidade; não explorável isoladamente hoje. |
| Informativo | Ponto forte confirmado, ou observação sem risco direto. |

## Paleta hexadecimal obrigatória (não trocar sem pedido explícito do usuário)

Reaproveitada dos design tokens do próprio projeto (`README_ARQUITETURA.md`,
`src/assets/styles/tokens.css`) para a marca, + uma paleta semântica fixa de
severidade. Está definida como o dict `PALETTE` no topo de
`docs/security-audit/generate_report.py` — se precisar mudar uma cor, mude
**só ali** (o resto do script referencia `PALETTE[...]`/`hexcolor(...)`, nunca
hardcode hex em outro lugar do script).

| Uso | Hex | Papel |
|---|---|---|
| `primary` | `#0066B3` | Azul IFCE — capa, cabeçalhos de tabela, títulos H1 |
| `primary_dark` | `#004A82` | Subtítulos H2 |
| `accent` | `#00D97E` | Verde institucional — reservado para destaques positivos |
| `dark` | `#1F2937` | Texto principal |
| `gray` | `#6B7280` | Texto secundário / rodapé |
| `light_bg` | `#F3F4F6` | Fundo de blocos de código e linhas zebradas de tabela |
| `border` | `#E5E7EB` | Bordas de tabela |
| `white` | `#FFFFFF` | Texto sobre fundo colorido |
| `Crítico` | `#B91C1C` | Badge/gráfico de severidade crítica |
| `Alto` | `#EA580C` | Badge/gráfico de severidade alta |
| `Médio` | `#D97706` | Badge/gráfico de severidade média |
| `Baixo` | `#2563EB` | Badge/gráfico de severidade baixa |
| `Informativo` | `#16A34A` | Badge/gráfico de pontos fortes |

## Estrutura obrigatória do PDF (não reordenar/remover seções)

1. **Capa** — título, subtítulo (projeto/organização), tabela de metadados
   (repositório, branch, data, executado por, categorias), faixa com os
   nomes das 5 categorias.
2. **Sumário**.
3. **1. Resumo Executivo** — narrativa da cadeia de exploração mais
   relevante + gráfico de **rosca** (severidade, só achados `weakness`) +
   gráfico de **barras empilhadas** (categoria × severidade) lado a lado +
   tabela de stack.
4. **2. Metodologia** — tabela de stack completa, mapeamento categoria→stack,
   tabela de critérios de severidade.
5. **3. Tabela de Achados Detalhados (arquivo:linha)** — uma linha por
   achado (fraqueza e ponto forte juntos), ordenada por categoria e
   severidade.
6. **4. Achados por Categoria — Descrição Completa** — um bloco por achado
   (badge de severidade + trecho de código + descrição/impacto/recomendação),
   agrupado por categoria na ordem de `meta.categories`.
7. **5. Recomendações Priorizadas** — só achados `weakness`, ordenados por
   severidade.
8. **6. Anexo — Templates de Issues para o GitHub** — um template Markdown
   por achado `weakness` com severidade Crítico/Alto/Médio (Baixo fica de
   fora do anexo, mas continua no corpo do relatório).

## Como rodar

```bash
cd docs/security-audit
python3 -m venv .venv          # só na 1ª vez — pasta já é gitignored
source .venv/bin/activate
pip install -r requirements.txt
python3 generate_report.py     # lê findings-data.json, escreve relatorio-auditoria-seguranca.pdf
```

Reexecutar `generate_report.py` sempre sobrescreve o PDF a partir do zero —
não é incremental, então basta editar `findings-data.json` e rodar de novo.

### Checagem pós-geração (fazer sempre, não só na primeira vez)

`Preformatted` (usado nos blocos de código e nos templates de issue) **não
quebra linha automaticamente** — uma linha de evidência ou de prosa acima de
~95-100 colunas vaza para fora da margem da página. Depois de gerar,
confirme que nada estourou a página antes de considerar a tarefa concluída:

```bash
python3 - <<'EOF'
import fitz
doc = fitz.open('relatorio-auditoria-seguranca.pdf')
pw = doc[0].rect.width
flagged = [(i+1, b[4][:60]) for i, p in enumerate(doc) for b in p.get_text('blocks') if b[2] > pw - 8]
print('páginas:', doc.page_count, '| overflow:', flagged or 'nenhum')
EOF
```

Se aparecer overflow: quebre a linha longa no JSON (`evidence`) com `\n`
manual, ou — para prosa livre nos templates de issue — confirme que ela está
passando por `wrap_prose()`/`textwrap.fill()` antes de entrar num
`Preformatted`. Nunca coloque texto de usuário/JSON não escapado dentro de um
`Paragraph` do ReportLab sem passar por `esc()` (ele interpreta `<`/`>`/`&`
como mini-XML); `Preformatted` não tem esse problema porque não interpreta
marcação.

## Onde ficam as coisas

| Arquivo | Papel |
|---|---|
| `docs/security-audit/findings-data.json` | Fonte da verdade dos achados — editar isto, não o script, para atualizar conteúdo. |
| `docs/security-audit/generate_report.py` | Gerador — só muda quando a *estrutura/estilo* do relatório muda, não quando os achados mudam. |
| `docs/security-audit/requirements.txt` | Dependências pinadas do venv isolado (`reportlab`, `matplotlib`). |
| `docs/security-audit/relatorio-auditoria-seguranca.pdf` | Saída final — commitada no repo a cada auditoria. |
| `docs/security-audit/assets/` e `docs/security-audit/.venv/` | Gerados/isolados — gitignored, não commitar. |
| `.claudecode/skills/audit-security.md` | Este arquivo — atualizar se o processo, a paleta ou a estrutura do relatório mudarem de verdade (raramente). |
