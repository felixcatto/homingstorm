import comments from '../__tests__/fixtures/comments.js';

export const seed = async knex => {
  await knex('comments').delete();
  await knex('comments').insert(comments);
};
