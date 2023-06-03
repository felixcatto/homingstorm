import { full } from '../__tests__/fixtures/articles.js';

export const seed = async knex => {
  await knex('articles').delete();
  await knex('articles').insert(full);
};
