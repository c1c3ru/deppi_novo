import type { Knex } from 'knex';

// Link do edital de cada edição dos anais ("Documentos da edição").
// Nullable: as edições já cadastradas ficam sem edital até alguém preencher.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('revista_edicoes', (table) => {
    table.string('edital_url', 1000);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('revista_edicoes', (table) => {
    table.dropColumn('edital_url');
  });
}
