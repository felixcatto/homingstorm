import { keygrip, orm } from '../../../lib/init.js';
import { ICurrentUser, IUnreadMessageSchema, IValidateQuery } from '../../../lib/types.js';
import { checkSignedIn, getCurrentUser, switchHttpMethod, validate } from '../../../lib/utils.js';
import { unreadMessageSchema } from '../../../models/index.js';

type ICtx = ICurrentUser & IValidateQuery<IUnreadMessageSchema>;

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  delete: [
    checkSignedIn,
    validate(unreadMessageSchema, 'query'),
    async (req, res, ctx: ICtx) => {
      const { currentUser, query } = ctx;
      const { receiver_id, sender_id } = query;
      if (receiver_id !== currentUser.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { UnreadMessage } = orm;
      await UnreadMessage.query().delete().where({ receiver_id, sender_id });
      res.status(201).json({});
    },
  ],
});
