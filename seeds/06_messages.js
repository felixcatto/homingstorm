import messages from '../__tests__/fixtures/messages.js';

export const seed = async knex => {
  await knex('messages').delete();
  await knex('messages').insert(messages);
};
