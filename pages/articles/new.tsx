import { isNull } from 'lodash-es';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../client/common/Layout.js';
import { getApiUrl, useContext, useSubmit, WithApiErrors } from '../../client/lib/utils.js';
import Form from '../../client/pages/articles/form.js';
import { keygrip, orm } from '../../lib/init.js';
import { ITag } from '../../lib/types.js';
import { getGenericProps, getUrl } from '../../lib/utils.js';

export async function getServerSideProps(ctx) {
  const props = await getGenericProps({ ctx, keygrip, orm });
  return { props };
}

const NewArticle = () => {
  const { axios } = useContext();
  const router = useRouter();
  const [tags, setTags] = React.useState<ITag[] | null>(null);

  React.useEffect(() => {
    axios.get(getApiUrl('tags')).then(data => setTags(data));
  }, []);

  const onSubmit = useSubmit(async values => {
    await axios.post(getApiUrl('articles'), values);
    router.push(getUrl('articles'));
  });

  return (
    <Layout>
      <h3>Create New Article</h3>
      {!isNull(tags) && <Form tags={tags} onSubmit={onSubmit} />}
    </Layout>
  );
};

export default WithApiErrors(NewArticle);
