import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('laboratorios').del();

  // Inserts seed entries
  await knex('laboratorios').insert([
    {
      name: 'LINC - Instrumental & Controle',
      description: 'O Laboratório de Instrumentação e Controle (LINC) dedica-se ao desenvolvimento de soluções em automação industrial, robótica e sistemas de controle avançado. Focado na transição para a Indústria 4.0, o laboratório integra tecnologias de hardware e software para otimização de processos produtivos.',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Desenvolvimento de Controller PID de Baixo Custo', type: 'Artigo', year: '2023' },
        { title: 'Sistema de Monitoramento IoT para Motores de Passo', type: 'Projeto de Extensão', year: '2024' }
      ]),
      services: JSON.stringify([
        { name: 'Consultoria em Automação', type: 'Consultoria', description: 'Otimização de linhas de produção usando PLC.' },
        { name: 'Treinamento em Arduino', type: 'Capacitação', description: 'Curso básico de prototipagem eletrônica.' }
      ]),
    },
    {
      name: 'LABVICIA - Visão & IA',
      description: 'O LABVICIA é o centro de excelência em Visão Computacional e Inteligência Artificial do campus. Pesquisamos algoritmos de Deep Learning, processamento de imagens e reconhecimento de padrões para aplicações na saúde, segurança e agricultura.',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Detecção de Pragas em Plantações de Milho via Drone', type: 'Patente', year: '2023' },
        { title: 'Análise de Fluxo de Pessoas em Ambientes Fechados', type: 'Artigo', year: '2024' }
      ]),
      services: JSON.stringify([
        { name: 'Desenvolvimento de Algoritmos', type: 'P&D', description: 'Criação de modelos customizados de IA.' }
      ]),
    },
    {
      name: 'LAESE - Embarcados',
      description: 'Especializado em Eletrônica e Sistemas Embarcados, o LAESE projeta circuitos e firmwares para dispositivos inteligentes, desde wearables até sistemas de sensoriamento remoto.',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Prototipagem de Smartwatch para Monitoramento de Idosos', type: 'TCC', year: '2022' }
      ]),
      services: JSON.stringify([
        { name: 'Design de PCB', type: 'Engenharia', description: 'Layout de placas de circuito impresso.' }
      ]),
    },
    {
      name: 'LIT - Inovação Tecnológica',
      description: 'O Laboratório de Inovação Tecnológica atua como uma incubadora de ideias, focando em prototipagem rápida, design thinking e desenvolvimento de produtos mínimos viáveis (MVPs).',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Prêmio IFCE de Inovação 2023', type: 'Prêmio', year: '2023' }
      ]),
      services: JSON.stringify([
        { name: 'Prototipagem 3D', type: 'Serviço Técnico', description: 'Impressão 3D e modelagem CAD.' }
      ]),
    },
    {
      name: 'LAPEQ - Química Aplicada',
      description: 'O LAPEQ realiza pesquisas fundamentais e aplicadas em química, com ênfase em análise de biocombustíveis, qualidade da água e síntese de novos materiais sustentáveis.',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Estudo sobre Estabilidade de Biodiesel de Palma', type: 'Artigo', year: '2024' }
      ]),
      services: JSON.stringify([
        { name: 'Análise de Água', type: 'Ensaio Laboratorial', description: 'Verificação de potabilidade e metais pesados.' }
      ]),
    },
    {
      name: 'LIMAV - Materiais & Vibrações',
      description: 'Focado no estudo de propriedades mecânicas e análise vibracional, o LIMAV auxilia indústrias na manutenção preditiva e no desenvolvimento de novos compostos metálicos.',
      cover_image: '',
      productions: JSON.stringify([
        { title: 'Redução de Ruído em Britadores Industriais', type: 'Case de Sucesso', year: '2023' }
      ]),
      services: JSON.stringify([
        { name: 'Análise Vibracional', type: 'Manutenção', description: 'Diagnóstico de falhas em máquinas rotativas.' }
      ]),
    },
    // Laboratórios disponíveis para agendamento de visitas escolares (FEAT-002).
    {
      name: 'LAQAMB - Laboratório de Química Ambiental',
      description: 'Destinado à realização de ensaios analíticos, aulas práticas e pesquisas voltadas ao monitoramento da qualidade do ar, água e solo. O espaço atende a projetos de controle de contaminação, tratamento de efluentes e desenvolvimento de tecnologias ambientais sustentáveis.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LAPP - Laboratório de Apoio às Práticas Pedagógicas',
      description: 'Espaço voltado ao planejamento, criação e experimentação de metodologias de ensino, recursos didáticos e tecnologias educacionais. O ambiente apoia a formação docente, o desenvolvimento de materiais pedagógicos e a inovação em processos de ensino-aprendizagem.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'MAKER - Espaço Maker',
      description: 'Ambiente colaborativo voltado para a cultura do "faça você mesmo", inovação e prototipagem rápida. Oferece suporte ao desenvolvimento de projetos multidisciplinares por meio do uso de impressoras 3D, corte a laser, ferramentas manuais e componentes eletrônicos.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'OFICINA - Oficina de Prototipagem e Manutenção',
      description: 'Espaço técnico equipado para a fabricação, montagem, ajuste e manutenção mecânica e eletroeletrônica de componentes e equipamentos. Presta suporte prático à execução de projetos de extensão, pesquisa aplicada e demandas institucionais.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LQOI - Laboratório de Química Orgânica e Inorgânica',
      description: 'Estruturado para a execução de práticas acadêmicas e de pesquisa em síntese, purificação, caracterização de compostos químicos e análise de reagentes orgânicos e inorgânicos, seguindo rígidos padrões de biossegurança.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LASIC - Laboratório de Sistemas Inteligentes e Computação',
      description: 'Dedicado ao desenvolvimento de pesquisas em inteligência artificial, computação aplicada, sistemas embarcados e redes de computadores. O laboratório apoia o desenvolvimento de software, algoritmos otimizados e soluções computacionais avançadas.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
  ]);
}
