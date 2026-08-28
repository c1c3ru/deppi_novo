import type { Knex } from 'knex';

// Remove definitivamente laboratórios de teste (ex: "Laboratório de Física
// (teste)") que tenham sido cadastrados manualmente durante testes manuais
// e não fazem parte do catálogo público de laboratórios.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `DELETE FROM laboratorios WHERE (name ILIKE ? OR name ILIKE ?) AND name ILIKE ?`,
    ['%física%', '%fisica%', '%teste%']
  );
}

export async function down(): Promise<void> {
  // Irreversível: dado de teste removido definitivamente, sem valor original a restaurar.
}
