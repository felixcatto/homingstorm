import { ActionArgs, json } from '@remix-run/node';
import { useNavigate, useParams } from '@remix-run/react';
import { IUserSchema } from 'lib/types';
import { checkAdmin, checkValueUnique, getCurrentUser, getParsedBody, validate } from 'lib/utils';
import { userSchema } from 'models';
import React from 'react';
import { keygrip, orm } from '../../../lib/init';
import { IUser } from '../../../lib/types';
import { getUrl } from '../../../lib/utils';
import Layout from '../../common/Layout';
import { WithApiErrors, useContext, useSubmit } from '../../lib/utils';
import Form from './form';

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

    default: {
      return json({}, { status: 404 });
    }
  }
};

const EditUser = () => {
  const { axios } = useContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = React.useState<IUser | null>(null);

  React.useEffect(() => {
    axios.get(getUrl('user', { id }, { withAvatar: true })).then(data => setUser(data));
  }, []);

  const onSubmit = useSubmit(async values => {
    await axios.put(getUrl('editUser', { id: user!.id }), values);
    navigate(getUrl('users'));
  });

  return (
    <Layout>
      <h3>Edit User</h3>
      {user && <Form onSubmit={onSubmit} user={user} />}
    </Layout>
  );
};

export default WithApiErrors(EditUser);
