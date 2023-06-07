import { Model } from 'objection';
import * as y from 'yup';
import { encrypt } from '../lib/secure';
import { IArticle, IAvatar, IComment, IRole } from '../lib/types';
import { roles } from '../lib/utils';
import { Article } from './Article';
import { Avatar } from './Avatar';
import { Comment } from './Comment';

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
