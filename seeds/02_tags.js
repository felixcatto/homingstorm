const tags = [
  { id: -1, name: 'general' },
  { id: -2, name: 'code' },
  { id: -3, name: 'random' },
  { id: -4, name: 'framework' },
];

module.exports.seed = async knex => {
  await knex('tags').delete();
  await knex('tags').insert(tags);
};
