import { isEmpty } from 'lodash-es';
import { keygrip, orm } from '../../../lib/init.js';
import { IArticleSchema, ICurrentUser, IValidate } from '../../../lib/types.js';
import {
  checkSignedIn,
  getCurrentUser,
  isSignedIn,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { articleSchema } from '../../../models/index.js';

type ICtx = IValidate<IArticleSchema> & ICurrentUser;

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  post: [
    checkSignedIn,
    validate(articleSchema),
    async (req, res, ctx: ICtx) => {
      const { Article } = orm;
      const { currentUser } = ctx;
      const { tagIds, ...articleData } = ctx.body;

      const article = await Article.query().insert(articleData);
      if (isSignedIn(currentUser)) {
        await article.$relatedQuery<any>('author').relate(currentUser.id);
      }

      if (!isEmpty(tagIds)) {
        await Promise.all(tagIds.map(tagId => article.$relatedQuery<any>('tags').relate(tagId)));
      }

      res.status(201).json(article);
    },
  ],
});
