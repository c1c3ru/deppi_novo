import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('school_visits', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('school_name', 500).notNullable();
    table.string('responsible_name', 255).notNullable();
    table.string('contact_email', 255).notNullable();
    table.string('contact_phone', 30).notNullable();
    table.integer('students_count').notNullable();
    table.date('target_date').notNullable();
    table.string('shift', 1).notNullable(); // M, T, N
    table.string('status', 20).defaultTo('pending'); // pending, confirmed, canceled, completed
    table.timestamps(true, true); // created_at, updated_at
  });

  await knex.raw('CREATE INDEX idx_school_visits_status ON school_visits(status)');
  await knex.raw(
    'CREATE INDEX idx_school_visits_target_date ON school_visits(target_date)'
  );

  await knex.schema.createTable('visit_lab_availability', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table
      .uuid('visit_id')
      .notNullable()
      .references('id')
      .inTable('school_visits')
      .onDelete('CASCADE');
    table
      .uuid('lab_id')
      .notNullable()
      .references('id')
      .inTable('laboratorios')
      .onDelete('CASCADE');
    table.string('status', 20).defaultTo('pending'); // pending, available, unavailable
    table
      .integer('updated_by_user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamps(true, true);
  });

  await knex.raw(
    'CREATE UNIQUE INDEX idx_visit_lab_availability_unique ON visit_lab_availability(visit_id, lab_id)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('visit_lab_availability');
  await knex.schema.dropTable('school_visits');
}
