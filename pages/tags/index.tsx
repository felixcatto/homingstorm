import Link from 'next/link';
import Layout from '../../client/common/Layout.js';
import { session } from '../../client/globalStore/store.js';
import { getApiUrl, getUrl, useContext, useRefreshPage } from '../../client/lib/utils.js';
import { keygrip, orm } from '../../lib/init.js';
import { ITag } from '../../lib/types.js';
import { getGenericProps } from '../../lib/utils.js';

type ITagsProps = {
  tags: ITag[];
};

export async function getServerSideProps(ctx) {
  const tags = await orm.Tag.query();
  const props = await getGenericProps({ ctx, keygrip, orm }, { tags });
  return { props };
}

const Tags = ({ tags }: ITagsProps) => {
  const { useStore, axios } = useContext();
  const { isSignedIn } = useStore(session);
  const refreshPage = useRefreshPage();

  const deleteTag = id => async () => {
    await axios.delete(getApiUrl('tag', { id }));
    refreshPage();
  };

  return (
    <Layout>
      <h3>Tags List</h3>

      {isSignedIn && (
        <Link href={getUrl('newTag')} className="btn mb-6">
          Create new tag
        </Link>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            {isSignedIn && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tags?.map(tag => (
            <tr key={tag.id}>
              <td>{tag.name}</td>
              {isSignedIn && (
                <td>
                  <div className="flex justify-end">
                    <Link
                      href={getUrl('editTag', { id: tag.id })}
                      className="btn-outline btn-outline_sm mr-2"
                    >
                      Edit Tag
                    </Link>
                    <div className="btn-outline btn-outline_sm" onClick={deleteTag(tag.id)}>
                      Remove Tag
                    </div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Tags;
