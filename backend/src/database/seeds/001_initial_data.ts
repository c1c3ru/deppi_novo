import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Limpar dados existentes
  await knex('news').del();
  await knex('boletins').del();
  await knex('sessions').del();
  await knex('uploads').del();
  await knex('users').del();

  // Inserir usuário de teste
  const hashedPassword = await bcrypt.hash('123456', 12);

  const [userRow] = await knex('users').insert({
    registration: '12345',
    name: 'Usuário Teste',
    email: 'teste@ifce.edu.br',
    password_hash: hashedPassword,
    roles: JSON.stringify(['user', 'admin']),
    is_active: true,
    email_verified_at: knex.fn.now(),
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }).returning('id');
  const userId = typeof userRow === 'object' ? userRow.id : userRow;

  // Inserir boletim de exemplo
  const [boletimRow] = await knex('boletins').insert({
    title: 'Boletim DEPPI - Janeiro 2024',
    description: 'Relatório mensal das atividades do Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação',
    content: `
# Boletim DEPPI - Janeiro 2024

## Atividades Realizadas

### 1. Pesquisa e Inovação
O DEPPI lançou um novo projeto de pesquisa em colaboração com empresas parceiras do IFCE.

### 2. Extensão Comunitária
Foram realizadas 15 ações de extensão atingindo mais de 500 pessoas na comunidade.

### 3. Pós-Graduação
Novo curso de mestrado aprovado com início previsto para março de 2024.

## Próximas Atividades

- Seminário de Inovação Tecnológica (15/02)
- Workshop de Metodologias Ágeis (28/02)
- Feira de Projetos de Extensão (10/03)

## Contato

Para mais informações, entre em contato através do email: deppi@ifce.edu.br
    `,
    publication_date: '2024-01-31',
    file_url: '/uploads/boletins/boletim-janeiro-2024.pdf',
    status: 'published',
    created_by: userId,
    is_featured: true,
    view_count: 0,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }).returning('id');
  const boletimId = typeof boletimRow === 'object' ? boletimRow.id : boletimRow;

  // Inserir notícias relacionadas ao boletim
  await knex('news').insert([
    {
      boletim_id: boletimId,
      title: 'Novo Projeto de Pesquisa Aprovado',
      content: 'O DEPPI aprovou um novo projeto de pesquisa em colaboração com empresas parceiras do IFCE, focado em desenvolvimento de tecnologias sustentáveis para o semiárido cearense.',
      image_url: '/uploads/news/pesquisa-2024.jpg',
      order: 1,
      is_main: true,
      is_active: true,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      boletim_id: boletimId,
      title: 'Ações de Extensão Atingem 500 Participantes',
      content: 'Foram realizadas 15 ações de extensão no último mês, abrangendo temas como educação ambiental, tecnologia assistiva e capacitação profissional.',
      image_url: '/uploads/news/extensao-2024.jpg',
      order: 2,
      is_main: false,
      is_active: true,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      boletim_id: boletimId,
      title: 'Mestrado em Inovação Tecnológica',
      content: 'Novo curso de mestrado stricto sensu aprovado, com início previsto para março de 2024. As inscrições estarão abertas a partir de fevereiro.',
      order: 3,
      is_main: false,
      is_active: true,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  console.log('✅ Seeds executados com sucesso!');
  console.log('   Usuário de teste criado: 12345 / 123456');
  console.log('   Boletim de exemplo criado com 3 notícias');
}
