import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('refresh_token_hash', 255).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.string('user_agent', 500).nullable();
    table.string('ip_address', 45).nullable(); // IPv6 support
    table.timestamp('last_activity_at').defaultTo(knex.fn.now());
    table.timestamps(true, true); // created_at, updated_at
  });

  // Criar índices
  await knex.raw('CREATE INDEX idx_sessions_user_id ON sessions(user_id)');
  await knex.raw('CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token_hash)');
  await knex.raw('CREATE INDEX idx_sessions_expires_at ON sessions(expires_at)');
  await knex.raw('CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_at)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sessions');
}
