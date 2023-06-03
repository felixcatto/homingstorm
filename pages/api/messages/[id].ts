import { keygrip, orm } from '../../../lib/init.js';
import { ICurrentUser, IMessageSchema, IOrm, IValidate } from '../../../lib/types.js';
import {
  checkSignedIn,
  getCurrentUser,
  isBelongsToUser,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { messageSchema } from '../../../models/index.js';

type ICtx = IValidate<IMessageSchema> & ICurrentUser;

const getMessageAuthorId = async ({ Message }: IOrm, articleId) => {
  const message = await Message.query().findById(articleId);
  return message?.sender_id;
};

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  put: [
    checkSignedIn,
    async (req, res, ctx: ICtx) => {
      const messageAuthorId = await getMessageAuthorId(orm, req.query.id!);
      if (!isBelongsToUser(ctx.currentUser)(messageAuthorId)) {
        res.status(403).json({ message: 'Forbidden' });
      }
    },
    validate(messageSchema),
    async (req, res, ctx: ICtx) => {
      const id = req.query.id!;
      const sender_id = ctx.currentUser.id;
      const { Message, UnreadMessage } = orm;
      const message = await Message.query().updateAndFetchById(id, ctx.body);
      await UnreadMessage.query()
        .insert({
          message_id: message.id,
          receiver_id: ctx.body.receiver_id,
          sender_id,
        })
        .onConflict()
        .ignore();

      res.status(201).json(message);
    },
  ],
  delete: [
    checkSignedIn,
    async (req, res, ctx: ICtx) => {
      const messageAuthorId = await getMessageAuthorId(orm, req.query.id!);
      if (!isBelongsToUser(ctx.currentUser)(messageAuthorId)) {
        res.status(403).json({ message: 'Forbidden' });
      }
    },
    async (req, res) => {
      const id = req.query.id!;
      await orm.Message.query().deleteById(id);
      res.status(201).json({ id });
    },
  ],
});
