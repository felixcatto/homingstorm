import avatars from '../__tests__/fixtures/avatars.js';

export const seed = async knex => {
  await knex('avatars').delete();
  await knex('avatars').insert(avatars);
};
