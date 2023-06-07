import { Model } from 'objection';
import * as y from 'yup';
import { IUser } from '../lib/types';
import { User } from './User';

export class Message extends Model {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  sender_id: number;
  receiver_id: number;
  sender?: IUser;
  receiver?: IUser;

  static get tableName() {
    return 'messages';
  }

  static get relationMappings() {
    return {
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'messages.sender_id',
          to: 'users.id',
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'messages.receiver_id',
          to: 'users.id',
        },
      },
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

export const messageSchema = y.object({
  text: y.string().required('required'),
  receiver_id: y.number().required('required'),
});
