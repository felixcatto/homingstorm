import { keygrip, orm } from '../../../../../lib/init.js';
import { ICommentSchema, ICurrentUser, IValidate } from '../../../../../lib/types.js';
import {
  getCurrentUser,
  isSignedIn,
  switchHttpMethod,
  validate,
} from '../../../../../lib/utils.js';
import { commentsSchema } from '../../../../../models/index.js';

type ICtx = IValidate<ICommentSchema> & ICurrentUser;

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  post: [
    validate(commentsSchema),
    async (req, res, ctx: ICtx) => {
      const { currentUser } = ctx;
      if (!isSignedIn(currentUser) && !ctx.body.guest_name) {
        return res
          .status(400)
          .json({ message: 'Input is not valid', errors: { guest_name: 'required' } });
      }

      const articleId = req.query.id!;
      const { Comment } = orm;
      const comment = await Comment.query().insert(ctx.body);
      await comment.$relatedQuery<any>('article').relate(articleId);
      if (isSignedIn(currentUser)) {
        await comment.$relatedQuery<any>('author').relate(currentUser.id);
      }
      res.status(201).json({ id: comment.id });
    },
  ],
});
