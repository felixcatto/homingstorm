export const up = async knex => {
  await knex.schema.createTable('messages', table => {
    table.increments().primary();
    table.text('text');
    table.string('created_at').defaultTo(new Date().toISOString());
    table.string('updated_at').defaultTo(new Date().toISOString());
    table.integer('sender_id').references('users.id').onDelete('set null');
    table.integer('receiver_id').references('users.id').onDelete('set null');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('messages');
};
