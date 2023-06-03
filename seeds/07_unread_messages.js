import messages from '../__tests__/fixtures/unreadMessages.js';

export const seed = async knex => {
  await knex('unread_messages').delete();
  await knex('unread_messages').insert(messages);
};
