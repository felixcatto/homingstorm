import { ActionArgs, LoaderArgs, json } from '@remix-run/node';
import cookie from 'cookie';
import { keygrip, orm } from '../../lib/init';
import { encrypt } from '../../lib/secure';
import { IGetSessionResponse, IUserLoginSchema } from '../../lib/types';
import {
  checkSignedIn,
  decomposeValue,
  getCurrentUser,
  getParsedBody,
  getSessionCookie,
  guestUser,
  makeErrors,
  removeSessionCookie,
  sessionName,
  setCookieHeader,
  validate,
} from '../../lib/utils';
import { userLoginSchema } from '../../models/User';

export const loader = async ({ request }: LoaderArgs) => {
  const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);
  checkSignedIn(currentUser);

  const cookies = cookie.parse(request.headers.get('Cookie')!);
  const sessionValue = cookies[sessionName];
  const [userId, signature] = decomposeValue(sessionValue);
  const data: IGetSessionResponse = { userId: Number(userId), signature };
  return json(data);
};
export const action = async ({ request }: ActionArgs) => {
  switch (request.method) {
    case 'POST': {
      const rawBody = await getParsedBody(request);
      const body = validate<IUserLoginSchema>(userLoginSchema, rawBody);

      const { User } = orm;
      const user = await User.query().findOne('email', body.email).withGraphFetched('avatar');
      if (!user) {
        return json(makeErrors({ email: 'User with such email not found' }), { status: 400 });
      }

      if (user.password_digest !== encrypt(body.password)) {
        return json(makeErrors({ password: 'Wrong password' }), { status: 400 });
      }

      const sessionCookie = getSessionCookie(keygrip, user.id);
      return json(user, { status: 201, headers: { [setCookieHeader]: sessionCookie } });
    }

    case 'DELETE': {
      const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);

      return json(
        { currentUser: guestUser, signOutUserId: currentUser.id },
        { status: 201, headers: { [setCookieHeader]: removeSessionCookie } }
      );
    }

    default:
      return json({}, { status: 404 });
  }
};
