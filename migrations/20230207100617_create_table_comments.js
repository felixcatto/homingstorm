export const up = async knex => {
  await knex.schema.createTable('comments', table => {
    table.increments().primary();
    table.string('guest_name');
    table.text('text');
    table.string('created_at').defaultTo(new Date().toISOString());
    table.string('updated_at').defaultTo(new Date().toISOString());
    table.integer('author_id').references('users.id').onDelete('set null');
    table.integer('article_id').references('articles.id').onDelete('cascade');
  });
};

export const down = async knex => {
  await knex.schema.dropTable('comments');
};
