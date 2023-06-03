import { keygrip, orm } from '../../../../../lib/init.js';
import { ICommentSchema, ICurrentUser, IOrm, IValidate } from '../../../../../lib/types.js';
import {
  checkSignedIn,
  getCurrentUser,
  isAdmin,
  isBelongsToUser,
  switchHttpMethod,
  validate,
} from '../../../../../lib/utils.js';
import { commentsSchema } from '../../../../../models/index.js';

type ICtx = IValidate<ICommentSchema> & ICurrentUser;

const getCommentAuthorId = async ({ Comment }: IOrm, commentId) => {
  const comment = await Comment.query().findById(commentId);
  return comment?.author_id;
};

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: async (req, res) => {
    const commentId = req.query.commentId!;
    const comment = await orm.Comment.query().findById(commentId);
    if (!comment) {
      return res.status(400).json({ message: `Entity with id '${commentId}' not found` });
    }
    res.json(comment);
  },
  put: [
    checkSignedIn,
    validate(commentsSchema),
    async (req, res, ctx: ICtx) => {
      const commentId = req.query.commentId!;
      const { Comment } = orm;

      const commentAuthorId = await getCommentAuthorId(orm, req.query.commentId!);
      if (commentAuthorId) {
        if (!isBelongsToUser(ctx.currentUser)(commentAuthorId)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      } else {
        // guest comment
        if (!isAdmin(ctx.currentUser)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
        if (!ctx.body.guest_name) {
          return res
            .status(400)
            .json({ message: 'Input is not valid', errors: { guest_name: 'required' } });
        }
      }

      await Comment.query().update(ctx.body).where('id', commentId);
      res.status(201).json({ id: commentId });
    },
  ],
  delete: [
    checkSignedIn,
    async (req, res, ctx: ICtx) => {
      const commentAuthorId = await getCommentAuthorId(orm, req.query.commentId!);
      if (!isBelongsToUser(ctx.currentUser)(commentAuthorId)) {
        res.status(403).json({ message: 'Forbidden' });
      }
    },
    async (req, res) => {
      const commentId = req.query.commentId!;
      await orm.Comment.query().deleteById(commentId);
      res.status(201).json({ id: commentId });
    },
  ],
});
