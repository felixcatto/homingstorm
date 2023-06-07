module.exports.up = async knex => {
  await knex.schema.createTable('tags', table => {
    table.increments().primary();
    table.string('name');
  });
};

module.exports.down = async knex => {
  await knex.schema.dropTable('tags');
};
