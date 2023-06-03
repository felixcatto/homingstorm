import { keygrip, orm } from '../../../lib/init.js';
import { encrypt } from '../../../lib/secure.js';
import {
  ICurrentUser,
  IGetSessionResponse,
  IUserLoginSchema,
  IValidate,
} from '../../../lib/types.js';
import {
  checkSignedIn,
  decomposeValue,
  getCurrentUser,
  guestUser,
  makeErrors,
  removeSessionCookie,
  sessionName,
  setSessionCookie,
  switchHttpMethod,
  validate,
} from '../../../lib/utils.js';
import { userLoginSchema } from '../../../models/User.js';

type ICtx = ICurrentUser;

export default switchHttpMethod({
  get: [
    getCurrentUser(orm, keygrip),
    checkSignedIn,
    async (req, res) => {
      const sessionValue = req.cookies[sessionName]!;
      const [userId, signature] = decomposeValue(sessionValue);
      const data: IGetSessionResponse = { userId: Number(userId), signature };
      res.json(data);
    },
  ],
  post: [
    validate(userLoginSchema),
    async (req, res, ctx: IValidate<IUserLoginSchema>) => {
      const { User } = orm;
      const user = await User.query().findOne('email', ctx.body.email).withGraphFetched('avatar');
      if (!user) {
        return res.status(400).json(makeErrors({ email: 'User with such email not found' }));
      }

      if (user.password_digest !== encrypt(ctx.body.password)) {
        return res.status(400).json(makeErrors({ password: 'Wrong password' }));
      }

      setSessionCookie(res, keygrip, user.id);
      res.status(201).json(user);
    },
  ],
  delete: [
    getCurrentUser(orm, keygrip),
    (req, res, ctx: ICtx) => {
      removeSessionCookie(res);
      res.status(201).json({ currentUser: guestUser, signOutUserId: ctx.currentUser.id });
    },
  ],
});
