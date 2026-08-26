import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('revista_edicoes', (table) => {
    table.increments('id').primary();
    table.integer('volume').notNullable();
    table.integer('ano').notNullable();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.string('cover_image', 1000).nullable();
    table.string('status', 20).defaultTo('draft'); // draft, published
    table.timestamp('published_at').nullable();
    table
      .integer('created_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamps(true, true); // created_at, updated_at
  });

  await knex.raw('CREATE INDEX idx_revista_edicoes_status ON revista_edicoes(status)');
  await knex.raw(
    'CREATE UNIQUE INDEX idx_revista_edicoes_volume_ano ON revista_edicoes(volume, ano)'
  );

  await knex.schema.createTable('revista_artigos', (table) => {
    table.increments('id').primary();
    table
      .integer('edicao_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('revista_edicoes')
      .onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('summary').nullable();
    table.string('authors', 1000).nullable();
    table.text('content').notNullable();
    table.integer('order').defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.raw(
    'CREATE INDEX idx_revista_artigos_edicao_id ON revista_artigos(edicao_id)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('revista_artigos');
  await knex.schema.dropTable('revista_edicoes');
}
