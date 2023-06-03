export const up = async knex => {
  await knex.schema.createTable('articles_tags', table => {
    table.integer('article_id').references('articles.id').onDelete('cascade');
    table.integer('tag_id').references('tags.id').onDelete('cascade');
    table.primary(['article_id', 'tag_id']);
  });
};

export const down = async knex => {
  await knex.schema.dropTable('articles_tags');
};
