import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('uploads', (table) => {
    table.increments('id').primary();
    table.string('filename', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.bigInteger('size').notNullable(); // File size in bytes
    table.string('path', 1000).notNullable();
    table.string('url', 1000).notNullable();
    table.string('type', 20).defaultTo('file'); // file, image, document
    table.integer('uploaded_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('related_boletim_id').unsigned().nullable().references('id').inTable('boletins').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true); // created_at, updated_at
  });

  // Criar índices
  await knex.raw('CREATE INDEX idx_uploads_type ON uploads(type)');
  await knex.raw('CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by)');
  await knex.raw('CREATE INDEX idx_uploads_boletim ON uploads(related_boletim_id)');
  await knex.raw('CREATE INDEX idx_uploads_active ON uploads(is_active) WHERE is_active = true');
  await knex.raw('CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('uploads');
}
