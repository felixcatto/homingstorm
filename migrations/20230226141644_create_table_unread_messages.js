export const up = async knex => {
  await knex.schema.createTable('unread_messages', table => {
    table.increments().primary();
    table.integer('message_id').references('messages.id').onDelete('cascade');
    table.integer('sender_id').references('users.id').onDelete('set null');
    table.integer('receiver_id').references('users.id').onDelete('set null');
    table.unique('message_id');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('unread_messages');
};
