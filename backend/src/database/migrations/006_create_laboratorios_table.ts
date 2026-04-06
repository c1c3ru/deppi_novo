import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('laboratorios', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.string('cover_image');
    table.jsonb('productions').defaultTo('[]');
    table.jsonb('services').defaultTo('[]');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('laboratorios');
}
