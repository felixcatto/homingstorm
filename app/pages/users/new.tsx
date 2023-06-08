import { useNavigate } from '@remix-run/react';
import Layout from '../../common/Layout';
import { WithApiErrors, getApiUrl, getUrl, useContext, useSubmit } from '../../lib/utils';
import Form from './form';

const NewUser = () => {
  const { axios } = useContext();
  const navigate = useNavigate();

  const onSubmit = useSubmit(async values => {
    await axios.post(getApiUrl('users'), values);
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
