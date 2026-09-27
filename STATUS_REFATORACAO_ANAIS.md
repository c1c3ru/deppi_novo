# Status da refatoração: Revista → Anais

Arquivo de acompanhamento da migração do portal de publicações do DEPPI de
`/revista` para `/anais`. Atualizado a cada ciclo de trabalho.

Base de conteúdo: modelo aprovado pela Comissão (index, edição atual, edições
anteriores, normas, corpo editorial e expediente). A página de cada trabalho
segue a estrutura da Editora Realize (CONEDU), com a identidade visual do DEPPI.

## 1) Migração de rotas e tema

- [x] Rota `/revista` substituída por `/anais` no roteamento do Angular
      (`app.module.ts`, módulo em `src/app/features/anais`)
- [x] Links do cabeçalho e do rodapé apontando para `/anais`
- [x] Links antigos `/revista/...` redirecionados para `/anais/...` no nginx
      (301, preservando o resto do caminho e a query string)
- [x] Modo claro como padrão global. O tema escuro só aparece se a pessoa
      escolher no botão do cabeçalho; a preferência do sistema não é mais
      seguida e a chave antiga `theme` é descartada
- [x] Script inline do `index.html` e hash do CSP no `nginx.conf` atualizados

Sub-rotas: `/anais`, `/anais/edicao-atual`, `/anais/edicoes`,
`/anais/edicoes/:id`, `/anais/artigos/:id`, `/anais/normas`,
`/anais/corpo-editorial`, `/anais/expediente` e, com login,
`/anais/admin/...`.

## 2) Limpeza de UI

- [x] Cards Pesquisa, Extensão, Pós-Graduação, Inovação, Expediente, Edição
      Atual e Edições Anteriores removidos (componente `apresentacao` apagado)
- [x] Página inicial passa a ter a Apresentação aprovada, a edição atual com os
      trabalhos e as edições anteriores

## 3) Interface pública

- [x] Listagem de trabalhos no modelo dos anais da Editora Realize: título,
      autores, botões Acessar, PDF e Resumo
- [x] Busca por título, autor ou resumo (sem diferenciar acentos)
- [x] Paginação de 10 trabalhos por página e contagem de resultados
- [x] Barra lateral com os volumes e acesso rápido
- [x] Página do trabalho com caminho de navegação, resumo, PDF (embutido quando
      está no próprio site), texto completo, "Como citar" e outros trabalhos do
      volume
- [x] Normas, Corpo editorial e Expediente com o texto aprovado

## 4) Interface privada

- [x] Botões "+ Nova edição", "+ Adicionar trabalho", "Editar" e "Excluir" só
      aparecem com login (qualquer usuário autenticado, igual ao backend)
- [x] Logado, a lista de edições inclui rascunhos com o selo "Rascunho"
- [x] Formulário do trabalho aceita upload do PDF (usa `/api/upload/file`)
- [x] Testes com `canEdit = true` e `canEdit = false`
      (`trabalhos-list.component.spec.ts`)

## 5) Falhas de compilação ou dependências pendentes

Nenhuma falha. Validação feita:

- `ng build --configuration development`: sem erros
- `ng lint`: sem erros nos arquivos alterados
- `ng test`: 42 testes passando (eram 24)
- Conferência no navegador com API simulada: tema claro mesmo com o sistema
  em modo escuro; visitante sem botões de edição; logado com Editar, Excluir
  e Adicionar; busca; celular sem rolagem lateral

Pendências que não são erro:

- O banco não tem campo próprio para o PDF. O link fica no conteúdo do
  trabalho (o upload do formulário cuida disso). Nada foi alterado no banco
- A API e as tabelas continuam com o nome antigo (`/api/revista`,
  `revista_edicoes`, `revista_artigos`)
- Links de "Documentos da edição" (edital, programação) ainda dependem da TI
- ISSN segue como "A solicitar" até sair o número oficial
- A regra de redirecionamento do nginx não foi testada localmente (não há
  nginx no ambiente de desenvolvimento)
