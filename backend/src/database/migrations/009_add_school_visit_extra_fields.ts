import type { Knex } from 'knex';

// Campos adicionais coletados no agendamento de visitas escolares.
// Todos nullable: visitas já existentes no banco não têm esses dados e
// a migration não pode falhar/quebrar linhas atuais ao ser aplicada.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('school_visits', (table) => {
    table.string('school_city', 255);
    table.string('school_network', 100); // municipal, estadual, federal, privada, outra
    table.string('director_name', 255);
    table.string('institutional_email', 255);
    table.string('whatsapp_phone', 30);
    table.string('class_supervisors', 500);
    table.string('grade_level', 100);
    table.text('notes');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('school_visits', (table) => {
    table.dropColumn('school_city');
    table.dropColumn('school_network');
    table.dropColumn('director_name');
    table.dropColumn('institutional_email');
    table.dropColumn('whatsapp_phone');
    table.dropColumn('class_supervisors');
    table.dropColumn('grade_level');
    table.dropColumn('notes');
  });
}
