import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('news', (table) => {
    table.increments('id').primary();
    table.integer('boletim_id').unsigned().notNullable().references('id').inTable('boletins').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.string('image_url', 1000).nullable();
    table.integer('order').defaultTo(0);
    table.boolean('is_main').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true); // created_at, updated_at
  });

  // Criar índices
  await knex.raw('CREATE INDEX idx_news_boletim_id ON news(boletim_id)');
  await knex.raw('CREATE INDEX idx_news_order ON news(boletim_id, "order")');
  await knex.raw('CREATE INDEX idx_news_main ON news(boletim_id) WHERE is_main = true');
  await knex.raw('CREATE INDEX idx_news_active ON news(is_active) WHERE is_active = true');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('news');
}
