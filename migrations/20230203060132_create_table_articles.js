export const up = async knex => {
  await knex.schema.createTable('articles', table => {
    table.increments().primary();
    table.string('title');
    table.text('text');
    table.string('created_at').defaultTo(new Date().toISOString());
    table.string('updated_at').defaultTo(new Date().toISOString());
    table.integer('author_id').references('users.id').onDelete('set null');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('articles');
};
