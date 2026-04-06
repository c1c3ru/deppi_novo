import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('laboratorios').del();

  // Inserts seed entries
  await knex('laboratorios').insert([
    {
      name: 'LINC',
      description: 'Laboratório de Instrumentação e Controle focado na Indústria 4.0 e Automação.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LabVICIA',
      description: 'Laboratório de Visão Computacional e Inteligência Artificial.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LAESE',
      description: 'Laboratório de Eletrônica e Sistemas Embarcados.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LIT',
      description: 'Laboratório de Inovação Tecnológica com foco em prototipagem e projetos.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LAPEQ',
      description: 'Laboratório de Pesquisas Aplicadas em Química.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    },
    {
      name: 'LIMAV',
      description: 'Laboratório de Materiais e Vibrações focado em soluções industriais e engenharia.',
      cover_image: '',
      productions: JSON.stringify([]),
      services: JSON.stringify([]),
    }
  ]);
}
