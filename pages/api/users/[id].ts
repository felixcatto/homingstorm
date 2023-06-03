import { keygrip, orm } from '../../../lib/init.js';
import { IGetUserQuerySchema, IUserSchema, IValidate, IValidateQuery } from '../../../lib/types.js';
import {
  checkAdmin,
  checkValueUnique,
  getCurrentUser,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { getUserQuerySchema, userSchema } from '../../../models/index.js';

export default switchHttpMethod({
  preHandler: getCurrentUser(orm, keygrip),
  get: [
    validate(getUserQuerySchema, 'query'),
    async (req, res, ctx: IValidateQuery<IGetUserQuerySchema>) => {
      const id = req.query.id!;

      const { withAvatar } = ctx.query;
      const userQuery = orm.User.query().findById(id);
      if (withAvatar) {
        userQuery.withGraphFetched('avatar');
      }

      const user = await userQuery;
      if (!user) {
        return res.status(400).json({ message: `Entity with id '${id}' not found` });
      }
      return res.json(user);
    },
  ],
  put: [
    checkAdmin,
    validate(userSchema),
    async (req, res, ctx: IValidate<IUserSchema>) => {
      const id = req.query.id as string;
      const { User } = orm;
      const { isUnique, errors } = await checkValueUnique(User, 'email', ctx.body.email, id);
      if (!isUnique) {
        return res.status(400).json({ errors });
      }

      const user = await User.query().updateAndFetchById(id, ctx.body);
      res.status(201).json(user);
    },
  ],
  delete: [
    checkAdmin,
    async (req, res) => {
      const id = req.query.id!;
      await orm.User.query().delete().where('id', id);
      res.status(201).json({ id });
    },
  ],
});
