import type { Knex } from 'knex';

// Insere no banco os laboratórios do agendamento de visitas escolares
// (LAQAMB, LAPP, MAKER, OFICINA, LQOI, LASIC) — o seed correspondente
// (002_seed_laboratorios.ts) não é executado automaticamente em produção
// (só `migrate`, nunca `seed`, roda no deploy), então essa inserção
// precisa acontecer via migration para chegar de fato ao banco real.
// Idempotente: não insere de novo se o laboratório já existir.
const NOVOS_LABORATORIOS = [
  {
    name: 'LAQAMB - Laboratório de Química Ambiental',
    description:
      'Breve descrição das atividades do laboratório LAQAMB. Texto placeholder a ser substituído pela descrição oficial.',
  },
  {
    name: 'LAPP - Laboratório de Automação e Processos Produtivos',
    description:
      'Breve descrição das atividades do laboratório LAPP. Texto placeholder a ser substituído pela descrição oficial.',
  },
  {
    name: 'MAKER - Espaço Maker',
    description:
      'Breve descrição das atividades do laboratório MAKER. Texto placeholder a ser substituído pela descrição oficial.',
  },
  {
    name: 'OFICINA - Oficina de Prototipagem e Manutenção',
    description:
      'Breve descrição das atividades do laboratório OFICINA. Texto placeholder a ser substituído pela descrição oficial.',
  },
  {
    name: 'LQOI - Laboratório de Química Orgânica e Inorgânica',
    description:
      'Breve descrição das atividades do laboratório LQOI. Texto placeholder a ser substituído pela descrição oficial.',
  },
  {
    name: 'LASIC - Laboratório de Sistemas Inteligentes e Computação',
    description:
      'Breve descrição das atividades do laboratório LASIC. Texto placeholder a ser substituído pela descrição oficial.',
  },
];

export async function up(knex: Knex): Promise<void> {
  for (const lab of NOVOS_LABORATORIOS) {
    const existente = await knex('laboratorios')
      .where({ name: lab.name })
      .first();

    if (!existente) {
      await knex('laboratorios').insert({
        name: lab.name,
        description: lab.description,
        cover_image: '',
        productions: JSON.stringify([]),
        services: JSON.stringify([]),
      });
    }
  }

  // Normaliza a sigla do laboratório de visão computacional já existente
  // para "LABVICIA" (maiúsculo), sem duplicar o registro.
  await knex('laboratorios')
    .where({ name: 'LabVICIA - Visão & IA' })
    .update({ name: 'LABVICIA - Visão & IA' });
}

export async function down(knex: Knex): Promise<void> {
  await knex('laboratorios')
    .whereIn(
      'name',
      NOVOS_LABORATORIOS.map((lab) => lab.name)
    )
    .del();
}
