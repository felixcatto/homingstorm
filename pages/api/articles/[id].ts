import { difference } from 'lodash-es';
import { keygrip, orm } from '../../../lib/init.js';
import { IArticleSchema, ICurrentUser, IOrm, IValidate } from '../../../lib/types.js';
import {
  checkSignedIn,
  getCurrentUser,
  isBelongsToUser,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { articleSchema } from '../../../models/index.js';

type ICtx = IValidate<IArticleSchema> & ICurrentUser;

const getArticleAuthorId = async ({ Article }: IOrm, articleId) => {
  const article = await Article.query().findById(articleId);
  return article?.author_id;
};

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: async (req, res) => {
    const id = req.query.id!;
    const { Article } = orm;
    const article = await Article.query().findById(id).withGraphFetched('[author, tags]');
    if (!article) {
      return res.status(400).json({ message: `Entity with id '${id}' not found` });
    }
    return res.json(article);
  },
  put: [
    checkSignedIn,
    async (req, res, ctx: ICtx) => {
      const articleAuthorId = await getArticleAuthorId(orm, req.query.id!);
      if (!isBelongsToUser(ctx.currentUser)(articleAuthorId)) {
        res.status(403).json({ message: 'Forbidden' });
      }
    },
    validate(articleSchema),
    async (req, res, ctx: ICtx) => {
      const id = req.query.id!;
      const { Article } = orm;
      const { tagIds, ...articleData } = ctx.body;
      const article = await Article.query()
        .updateAndFetchById(id, articleData)
        .withGraphFetched('tags');
      const tagIdsToDelete = difference(article.tagIds, tagIds);
      const tagIdsToInsert = difference(tagIds, article.tagIds);

      await article.$relatedQuery<any>('tags').unrelate().where('id', 'in', tagIdsToDelete);
      await Promise.all(
        tagIdsToInsert.map(tagId => article.$relatedQuery<any>('tags').relate(tagId))
      );

      res.status(201).json(article);
    },
  ],
  delete: [
    checkSignedIn,
    async (req, res, ctx: ICtx) => {
      const articleAuthorId = await getArticleAuthorId(orm, req.query.id!);
      if (!isBelongsToUser(ctx.currentUser)(articleAuthorId)) {
        res.status(403).json({ message: 'Forbidden' });
      }
    },
    async (req, res) => {
      const id = req.query.id!;
      const { Article } = orm;
      await Article.query().deleteById(id);
      res.status(201).json({ id });
    },
  ],
});
