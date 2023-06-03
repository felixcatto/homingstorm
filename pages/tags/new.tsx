import { useRouter } from 'next/router';
import Layout from '../../client/common/Layout.js';
import { getApiUrl, useContext, useSubmit, WithApiErrors } from '../../client/lib/utils.js';
import Form from '../../client/pages/tags/form.js';
import { keygrip, orm } from '../../lib/init.js';
import { getGenericProps, getUrl } from '../../lib/utils.js';

export async function getServerSideProps(ctx) {
  const props = await getGenericProps({ ctx, keygrip, orm });
  return { props };
}

const Tag = () => {
  const { axios } = useContext();
  const router = useRouter();

  const onSubmit = useSubmit(async values => {
    await axios.post(getApiUrl('tags'), values);
    router.push(getUrl('tags'));
  });

  return (
    <Layout>
      <h3>Create New Tag</h3>
      <Form onSubmit={onSubmit} />
    </Layout>
  );
};

export default WithApiErrors(Tag);
