import { Model } from 'objection';
import * as y from 'yup';
import { encrypt } from '../lib/secure.js';
import { IArticle, IAvatar, IComment, IRole } from '../lib/types.js';
import { roles } from '../lib/utils.js';
import { Article } from './Article.js';
import { Avatar } from './Avatar.js';
import { Comment } from './Comment.js';

export class User extends Model {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password_digest: string;
  isDeleted: boolean;
  avatar_id: number;
  articles?: IArticle[];
  comments?: IComment[];
  avatar?: IAvatar;

  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    return {
      articles: {
        relation: Model.HasManyRelation,
        modelClass: Article,
        join: {
          from: 'users.id',
          to: 'articles.author_id',
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: 'users.id',
          to: 'comments.author_id',
        },
      },
      avatar: {
        relation: Model.BelongsToOneRelation,
        modelClass: Avatar,
        join: {
          from: 'users.avatar_id',
          to: 'avatars.id',
        },
      },
    };
  }

  set password(value) {
    this.password_digest = encrypt(value);
  }
}

export const userSchema = y.object({
  name: y.string().required('required'),
  role: y.mixed().oneOf(Object.values(roles)).required('required'),
  email: y.string().email().required('required'),
  password: y.string().required('required'),
});

export const userLoginSchema = y.object({
  email: y.string().email().required('required'),
  password: y.string().required('required'),
});

export const getUserQuerySchema = y.object({
  withAvatar: y.boolean(),
});
