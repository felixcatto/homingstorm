import { full } from '../__tests__/fixtures/articles_tags.js';

export const seed = async knex => {
  await knex('articles_tags').delete();
  await knex('articles_tags').insert(full);
};
