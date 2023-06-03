import { keygrip, orm } from '../../../lib/init.js';
import { ITagSchema, IValidate } from '../../../lib/types.js';
import { checkSignedIn, getCurrentUser, switchHttpMethod, validate } from '../../../lib/utils.js';
import { tagSchema } from '../../../models/index.js';

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: async (req, res) => {
    const { Tag } = orm;
    const tags = await Tag.query();
    res.status(200).json(tags);
  },
  post: [
    checkSignedIn,
    validate(tagSchema),
    async (req, res, ctx: IValidate<ITagSchema>) => {
      const { Tag } = orm;
      const tag = await Tag.query().insert(ctx.body);
      res.status(201).json(tag);
    },
  ],
});
