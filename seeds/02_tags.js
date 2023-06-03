import tags from '../__tests__/fixtures/tags.js';

export const seed = async knex => {
  await knex('tags').delete();
  await knex('tags').insert(tags);
};
