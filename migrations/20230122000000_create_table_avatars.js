module.exports.up = async knex => {
  await knex.schema.createTable('avatars', table => {
    table.increments().primary();
    table.string('path');
  });
};

module.exports.down = async knex => {
  await knex.schema.dropTable('avatars');
};
