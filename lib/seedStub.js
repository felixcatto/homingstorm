exports.seed = async knex => {
  await knex('table_name').delete();
  await knex('table_name').insert('?');
};
