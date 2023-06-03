export const up = async knex => {
  await knex.schema.createTable('tags', table => {
    table.increments().primary();
    table.string('name');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('tags');
};
