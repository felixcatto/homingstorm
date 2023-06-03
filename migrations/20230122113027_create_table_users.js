export const up = async knex => {
  await knex.schema.createTable('users', table => {
    table.increments().primary();
    table.string('name');
    table.string('role');
    table.string('email').unique();
    table.string('password_digest');
    table.boolean('isDeleted').defaultTo(false);
    table.integer('avatar_id').references('avatars.id').onDelete('set null');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('users');
};
