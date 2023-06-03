import { Model } from 'objection';
import * as y from 'yup';
import { IComment, ITag, IUser } from '../lib/types.js';
import { Comment } from './Comment.js';
import { Tag } from './Tag.js';
import { User } from './User.js';

export class Article extends Model {
  id: any;
  title: any;
  text: any;
  created_at: any;
  updated_at: any;
  author_id: any;
  author?: IUser;
  comments?: IComment[];
  tags?: ITag[];

  static get tableName() {
    return 'articles';
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'articles.author_id',
          to: 'users.id',
        },
      },

      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: 'articles.id',
          to: 'comments.article_id',
        },
      },

      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'articles.id',
          through: {
            from: 'articles_tags.article_id',
            to: 'articles_tags.tag_id',
          },
          to: 'tags.id',
        },
      },
    };
  }

  get tagIds() {
    return this.tags ? this.tags.map(tag => tag.id).sort() : [];
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

export const articleSchema = y.object({
  title: y.string().required('required'),
  text: y.string().default(''),
  tagIds: y.array().default([]),
});
