import { Model } from 'objection';
import * as y from 'yup';
import { Article } from './Article.js';
import { IArticle } from '../lib/types.js';

export class Tag extends Model {
  id: number;
  name: string;
  articles?: IArticle[];

  static get tableName() {
    return 'tags';
  }

  static get relationMappings() {
    return {
      articles: {
        relation: Model.ManyToManyRelation,
        modelClass: Article,
        join: {
          from: 'tags.id',
          through: {
            from: 'articles_tags.tag_id',
            to: 'articles_tags.article_id',
          },
          to: 'articles.id',
        },
      },
    };
  }
}

export const tagSchema = y.object({
  name: y.string().required('required'),
});
