import { Model } from 'objection';
import * as y from 'yup';
import { IMessage, IUser } from '../lib/types';
import { Message } from './Message';
import { User } from './User';

export class UnreadMessage extends Model {
  id: number;
  message_id: number;
  sender_id: number;
  receiver_id: number;
  sender?: IUser;
  receiver?: IUser;
  message?: IMessage;

  static get tableName() {
    return 'unread_messages';
  }

  static get relationMappings() {
    return {
      message: {
        relation: Model.HasOneRelation,
        modelClass: Message,
        join: {
          from: 'unread_messages.message_id',
          to: 'messages.id',
        },
      },
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'unread_messages.sender_id',
          to: 'users.id',
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'unread_messages.receiver_id',
          to: 'users.id',
        },
      },
    };
  }
}

export const unreadMessageSchema = y.object({
  sender_id: y.number().required('required'),
  receiver_id: y.number().required('required'),
});
