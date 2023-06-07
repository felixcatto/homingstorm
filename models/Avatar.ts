import { Model } from 'objection';
import { IUser } from '../lib/types';
import { User } from './User';

export class Avatar extends Model {
  id: number;
  path: string;
  users?: IUser[];

  static get tableName() {
    return 'avatars';
  }

  static get relationMappings() {
    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'avatars.id',
          to: 'users.avatar_id',
        },
      },
    };
  }
}
