import { ActionArgs, LoaderArgs, json } from '@remix-run/node';
import { IGetUserQuerySchema, IUserSchema } from 'lib/types';
import {
  checkAdmin,
  checkValueUnique,
  getCurrentUser,
  getParsedBody,
  getQueryString,
  validate,
} from 'lib/utils';
import { getUserQuerySchema, userSchema } from 'models';
import { keygrip, orm } from '../../../lib/init';

export const loader = async ({ request, params }: LoaderArgs) => {
  const rawQuery = getQueryString(request.url);
  const query = validate<IGetUserQuerySchema>(getUserQuerySchema, rawQuery);

  const { id } = params;
  const { withAvatar } = query;
  const userQuery = orm.User.query().findById(id);
  if (withAvatar) {
    userQuery.withGraphFetched('avatar');
  }

  const user = await userQuery;
  if (!user) {
    return json({ message: `Entity with id '${id}' not found` }, { status: 400 });
  }
  return json(user);
};

export const action = async ({ request, params }: ActionArgs) => {
  switch (request.method) {
    case 'PUT': {
      const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);
      checkAdmin(currentUser);

      const rawBody = await getParsedBody(request);
      const body = validate<IUserSchema>(userSchema, rawBody);

      const { id } = params;
      const { User } = orm;
      const { isUnique, errors } = await checkValueUnique(User, 'email', body.email, id);
      if (!isUnique) {
        return json({ errors }, { status: 400 });
      }

      const user = await User.query().updateAndFetchById(id, body);

      return json({ user }, { status: 201 });
    }

    case 'DELETE': {
      const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);
      checkAdmin(currentUser);

      const { id } = params;
      await orm.User.query().delete().where('id', id);
      return json({ id }, { status: 201 });
    }
  }

  return json({}, { status: 404 });
};
