import { keygrip, orm } from '../../../lib/init.js';
import { ICurrentUser, IMessageSchema, IValidate } from '../../../lib/types.js';
import {
  checkSignedIn,
  getCurrentUser,
  makeErrors,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { messageSchema } from '../../../models/index.js';

type ICtx = ICurrentUser & IValidate<IMessageSchema>;

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: async (req, res) => {
    const { Message } = orm;
    const messages = await Message.query();
    res.status(200).json(messages);
  },
  post: [
    checkSignedIn,
    validate(messageSchema),
    async (req, res, ctx: ICtx) => {
      const sender_id = ctx.currentUser.id;
      const { Message, UnreadMessage, User } = orm;
      const receiver = await User.query().findById(ctx.body.receiver_id);
      if (!receiver) {
        return res.status(400).json(makeErrors({ receiver_id: 'user does not exist' }));
      }
      const message = await Message.query().insert({ ...ctx.body, sender_id });
      await UnreadMessage.query().insert({
        message_id: message.id,
        receiver_id: ctx.body.receiver_id,
        sender_id,
      });

      const fullMessage = await Message.query()
        .withGraphFetched('[receiver.avatar, sender.avatar]')
        .findById(message.id)
        .orderBy('created_at', 'desc');
      res.status(201).json(fullMessage);
    },
  ],
});
