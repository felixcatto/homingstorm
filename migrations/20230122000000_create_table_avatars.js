export const up = async knex => {
  await knex.schema.createTable('avatars', table => {
    table.increments().primary();
    table.string('path');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('avatars');
};
