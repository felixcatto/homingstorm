import { ActionArgs, json } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import avatars from 'lib/avatars';
import {
  checkAdmin,
  checkValueUnique,
  getCurrentUser,
  getParsedBody,
  getRandomNumUpTo,
  validate,
} from 'lib/utils';
import { differenceBy, isEmpty } from 'lodash';
import { userSchema } from 'models';
import { keygrip, orm } from '../../../lib/init';
import { IUserSchema } from '../../../lib/types';
import Layout from '../../common/Layout';
import { WithApiErrors, getUrl, useContext, useSubmit } from '../../lib/utils';
import Form from './form';

export const action = async ({ request }: ActionArgs) => {
  switch (request.method) {
    case 'POST':
      const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);
      checkAdmin(currentUser);

      const rawBody = await getParsedBody(request);
      const body = validate<IUserSchema>(userSchema, rawBody);

      const { User } = orm;
      const { isUnique, errors } = await checkValueUnique(User, 'email', body.email);
      if (!isUnique) {
        return json({ errors }, { status: 400 });
      }

      const [_guestAvatar, ...userAvatars] = avatars;
      const existedUserAvatars = await orm.knex
        .select('a.id')
        .from('avatars as a')
        .join('users as u', 'u.avatar_id', '=', 'a.id')
        .groupBy('a.id');
      let newUserAvatar;
      const availabeFreeAvatars = differenceBy(userAvatars, existedUserAvatars, 'id');
      if (!isEmpty(availabeFreeAvatars)) {
        newUserAvatar = availabeFreeAvatars[getRandomNumUpTo(availabeFreeAvatars.length)];
      } else {
        newUserAvatar = userAvatars[getRandomNumUpTo(userAvatars.length)];
      }

      const user = await User.query().insert({ ...body, avatar_id: newUserAvatar.id });
      return json(user, { status: 201 });

    default:
      return json({}, { status: 404 });
  }
};

const NewUser = () => {
  const { axios } = useContext();
  const navigate = useNavigate();

  const onSubmit = useSubmit(async values => {
    await axios.post(getUrl('newUser'), values);
    navigate(getUrl('users'));
  });

  return (
    <Layout>
      <h3>Create New User</h3>
      <Form onSubmit={onSubmit} />
    </Layout>
  );
};

export default WithApiErrors(NewUser);
