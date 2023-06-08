import { useNavigate, useParams } from '@remix-run/react';
import React from 'react';
import { IUser } from '../../../lib/types';
import { getApiUrl, getUrl } from '../../../lib/utils';
import Layout from '../../common/Layout';
import { WithApiErrors, useContext, useSubmit } from '../../lib/utils';
import Form from './form';

const EditUser = () => {
  const { axios } = useContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = React.useState<IUser | null>(null);

  React.useEffect(() => {
    axios.get(getApiUrl('user', { id }, { withAvatar: true })).then(data => setUser(data));
  }, []);

  const onSubmit = useSubmit(async values => {
    await axios.put(getApiUrl('user', { id: user!.id }), values);
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
