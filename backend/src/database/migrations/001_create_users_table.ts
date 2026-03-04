import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('registration', 20).notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.jsonb('roles').defaultTo(JSON.stringify(['user']));
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at').nullable();
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  // Criar índices
  await knex.raw('CREATE INDEX idx_users_registration ON users(registration)');
  await knex.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.raw('CREATE INDEX idx_users_roles ON users USING GIN(roles)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
