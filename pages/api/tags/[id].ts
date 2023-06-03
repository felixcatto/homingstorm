import { keygrip, orm } from '../../../lib/init.js';
import { ITagSchema, IValidate } from '../../../lib/types.js';
import { checkSignedIn, getCurrentUser, switchHttpMethod, validate } from '../../../lib/utils.js';
import { tagSchema } from '../../../models/index.js';

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: async (req, res) => {
    const id = req.query.id!;
    const tag = await orm.Tag.query().findById(id!);
    if (!tag) {
      return res.status(400).json({ message: `Entity with id '${id}' not found` });
    }
    return res.json(tag);
  },
  put: [
    checkSignedIn,
    validate(tagSchema),
    async (req, res, ctx: IValidate<ITagSchema>) => {
      const id = req.query.id!;
      const { Tag } = orm;
      const tag = await Tag.query().updateAndFetchById(id, ctx.body);
      res.status(201).json(tag);
    },
  ],
  delete: [
    checkSignedIn,
    async (req, res) => {
      const id = req.query.id!;
      await orm.Tag.query().delete().where('id', id);
      res.status(201).json({ id });
    },
  ],
});
