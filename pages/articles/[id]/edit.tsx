import { isEmpty } from 'lodash-es';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../../client/common/Layout.js';
import { session } from '../../../client/globalStore/store.js';
import {
  getApiUrl,
  useContext,
  useMergeState,
  useSubmit,
  WithApiErrors,
} from '../../../client/lib/utils.js';
import Form from '../../../client/pages/articles/form.js';
import { keygrip, orm } from '../../../lib/init.js';
import { IArticle, ITag } from '../../../lib/types.js';
import { getGenericProps, getUrl } from '../../../lib/utils.js';

type IState = {
  article: IArticle | null;
  tags: ITag[];
};

export async function getServerSideProps(ctx) {
  const props = await getGenericProps({ ctx, keygrip, orm });
  return { props };
}

const EditArticle = () => {
  const router = useRouter();
  const { axios, useStore } = useContext();
  const { id } = router.query;
  const { isBelongsToUser } = useStore(session);
  const [{ article, tags }, setState] = useMergeState<IState>({ article: null, tags: [] });

  React.useEffect(() => {
    Promise.all([axios.get(getApiUrl('article', { id })), axios.get(getApiUrl('tags'))]).then(
      ([articleData, tagsData]) => setState({ article: articleData, tags: tagsData })
    );
  }, []);

  const onSubmit = useSubmit(async values => {
    await axios.put(getApiUrl('article', { id: article!.id }), values);
    router.push(getUrl('articles'));
  });

  if (isEmpty(article)) return <Layout />;
  if (!isBelongsToUser(article.author_id)) return <Layout>403 forbidden</Layout>;

  return (
    <Layout>
      <h3>Edit Article</h3>
      <Form article={article} tags={tags} onSubmit={onSubmit} />
    </Layout>
  );
};

export default WithApiErrors(EditArticle);
