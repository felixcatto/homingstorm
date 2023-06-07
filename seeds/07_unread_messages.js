const messages = [
  {
    id: -1,
    message_id: -5,
    sender_id: -3,
    receiver_id: -1,
  },
  {
    id: -2,
    message_id: -4,
    sender_id: -3,
    receiver_id: -1,
  },
];

module.exports.seed = async knex => {
  await knex('unread_messages').delete();
  await knex('unread_messages').insert(messages);
};
