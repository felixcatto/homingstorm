import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../../client/common/Layout.js';
import { getApiUrl, useContext, useSubmit, WithApiErrors } from '../../../client/lib/utils.js';
import Form from '../../../client/pages/users/form.js';
import { keygrip, orm } from '../../../lib/init.js';
import { IUser } from '../../../lib/types.js';
import { getGenericProps, getUrl } from '../../../lib/utils.js';

export async function getServerSideProps(ctx) {
  const props = await getGenericProps({ ctx, keygrip, orm });
  return { props };
}

const EditUser = () => {
  const { axios } = useContext();
  const router = useRouter();
  const [user, setUser] = React.useState<IUser | null>(null);
  const { id } = router.query;

  React.useEffect(() => {
    axios.get(getApiUrl('user', { id })).then(data => setUser(data));
  }, []);

  const onSubmit = useSubmit(async values => {
    await axios.put(getApiUrl('user', { id: user!.id }), values);
    router.push(getUrl('users'));
  });

  return (
    <Layout>
      <h3>Edit User</h3>
      {user && <Form onSubmit={onSubmit} user={user} />}
    </Layout>
  );
};

export default WithApiErrors(EditUser);
