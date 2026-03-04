import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('boletins', (table) => {
    table.increments('id').primary();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.text('content').nullable();
    table.date('publication_date').notNullable();
    table.string('file_url', 1000).nullable();
    table.string('status', 20).defaultTo('draft'); // draft, published, archived
    table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_featured').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true); // created_at, updated_at
  });

  // Criar índices
  await knex.raw('CREATE INDEX idx_boletins_status ON boletins(status)');
  await knex.raw('CREATE INDEX idx_boletins_publication_date ON boletins(publication_date DESC)');
  await knex.raw('CREATE INDEX idx_boletins_created_by ON boletins(created_by)');
  await knex.raw('CREATE INDEX idx_boletins_featured ON boletins(is_featured) WHERE is_featured = true');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('boletins');
}
