import type { Knex } from 'knex';

// Insere no banco os laboratórios do agendamento de visitas escolares
// (LAQAMB, LAPP, MAKER, OFICINA, LQOI, LASIC) — o seed correspondente
// (002_seed_laboratorios.ts) não é executado automaticamente em produção
// (só `migrate`, nunca `seed`, roda no deploy), então essa inserção
// precisa acontecer via migration para chegar de fato ao banco real.
// Idempotente: não insere de novo se o laboratório já existir.
//
// Descrições oficiais (ver também migration 012_atualiza_descricoes_laboratorios,
// que corrige esses mesmos campos em bancos que já rodaram esta migration
// quando ela ainda inseria texto placeholder).
const NOVOS_LABORATORIOS = [
  {
    name: 'LAQAMB - Laboratório de Química Ambiental',
    description:
      'Destinado à realização de ensaios analíticos, aulas práticas e pesquisas voltadas ao monitoramento da qualidade do ar, água e solo. O espaço atende a projetos de controle de contaminação, tratamento de efluentes e desenvolvimento de tecnologias ambientais sustentáveis.',
  },
  {
    name: 'LAPP - Laboratório de Apoio às Práticas Pedagógicas',
    description:
      'Espaço voltado ao planejamento, criação e experimentação de metodologias de ensino, recursos didáticos e tecnologias educacionais. O ambiente apoia a formação docente, o desenvolvimento de materiais pedagógicos e a inovação em processos de ensino-aprendizagem.',
  },
  {
    name: 'MAKER - Espaço Maker',
    description:
      'Ambiente colaborativo voltado para a cultura do "faça você mesmo", inovação e prototipagem rápida. Oferece suporte ao desenvolvimento de projetos multidisciplinares por meio do uso de impressoras 3D, corte a laser, ferramentas manuais e componentes eletrônicos.',
  },
  {
    name: 'OFICINA - Oficina de Prototipagem e Manutenção',
    description:
      'Espaço técnico equipado para a fabricação, montagem, ajuste e manutenção mecânica e eletroeletrônica de componentes e equipamentos. Presta suporte prático à execução de projetos de extensão, pesquisa aplicada e demandas institucionais.',
  },
  {
    name: 'LQOI - Laboratório de Química Orgânica e Inorgânica',
    description:
      'Estruturado para a execução de práticas acadêmicas e de pesquisa em síntese, purificação, caracterização de compostos químicos e análise de reagentes orgânicos e inorgânicos, seguindo rígidos padrões de biossegurança.',
  },
  {
    name: 'LASIC - Laboratório de Sistemas Inteligentes e Computação',
    description:
      'Dedicado ao desenvolvimento de pesquisas em inteligência artificial, computação aplicada, sistemas embarcados e redes de computadores. O laboratório apoia o desenvolvimento de software, algoritmos otimizados e soluções computacionais avançadas.',
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
