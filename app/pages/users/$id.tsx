import { ActionArgs, LoaderArgs, json } from '@remix-run/node';
import { IGetUserQuerySchema } from 'lib/types';
import { checkAdmin, getCurrentUser, getQueryString, validate } from 'lib/utils';
import { getUserQuerySchema } from 'models';
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
    case 'DELETE': {
      const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);
      checkAdmin(currentUser);

      const { id } = params;
      await orm.User.query().delete().where('id', id);
      return json({ id }, { status: 201 });
    }

    default: {
      return json({}, { status: 404 });
    }
  }
};
