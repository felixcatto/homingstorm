import { isEmpty, isNull, uniqBy } from 'lodash-es';
import Link from 'next/link';
import React from 'react';
import Layout from '../../client/common/Layout.js';
import { session } from '../../client/globalStore/store.js';
import {
  filterTypes,
  fmtISO,
  getApiUrl,
  getUrl,
  useContext,
  useRefreshPage,
  useSelectedRows,
  useTable,
} from '../../client/lib/utils.js';
import { Expandbox } from '../../client/ui/Checkbox.jsx';
import { Collapse } from '../../client/ui/Collapse.jsx';
import { HeaderCell } from '../../client/ui/HeaderCell.jsx';
import { Pagination } from '../../client/ui/Pagination.jsx';
import { keygrip, orm } from '../../lib/init.js';
import { IArticle, IFiltersMap, ISelectFilter, ITag } from '../../lib/types.js';
import { getGenericProps } from '../../lib/utils.js';

type IArticlesProps = {
  articles: IArticle[];
};

export async function getServerSideProps(ctx) {
  const articles = await orm.Article.query()
    .withGraphFetched('[author, tags, comments.author.avatar]')
    .orderBy('id');
  const props = await getGenericProps({ ctx, keygrip, orm }, { articles });
  return { props };
}

const Articles = ({ articles }: IArticlesProps) => {
  const { axios, useStore } = useContext();
  const { isSignedIn, isBelongsToUser } = useStore(session);
  const refreshPage = useRefreshPage();

  const defaultFilters: IFiltersMap = React.useMemo(() => {
    const rawTags = articles.flatMap(el => el.tags!);
    const existedTagsFilterOptions = uniqBy(rawTags, 'id').map(el => ({
      value: el.id,
      label: el.name,
    }));
    const tagsFilterOptions = [{ value: null, label: '' }].concat(existedTagsFilterOptions);

    return {
      title: {
        filterBy: 'title',
        filterType: filterTypes.search,
        filter: '',
      },
      text: {
        filterBy: 'text',
        filterType: filterTypes.search,
        filter: '',
      },
      'author.name': {
        filterBy: 'author.name',
        filterType: filterTypes.search,
        filter: '',
      },
      tags: {
        filterBy: 'tags',
        filterType: filterTypes.select,
        filter: [],
        filterOptions: tagsFilterOptions,
        customFilterFn: (rowValue: ITag[], filter: ISelectFilter) => {
          const tagsIds = rowValue.map(el => el.id);
          return filter.some(
            selectFilter =>
              tagsIds.includes(selectFilter.value) ||
              (isEmpty(tagsIds) && isNull(selectFilter.value))
          );
        },
      },
    };
  }, [articles]);

  const tableColCount = 6;
  const { rows, totalRows, paginationProps, headerCellProps } = useTable({
    rows: articles,
    page: 0,
    size: 3,
    sortBy: null,
    sortOrder: null,
    filters: defaultFilters,
  });

  const { isRowSelected: isRowExpanded, onSelectRow: onExpandRow } = useSelectedRows({ rows });

  const deleteArticle = id => async () => {
    await axios.delete(getApiUrl('article', { id }));
    refreshPage();
  };

  return (
    <Layout>
      <h3>Articles List</h3>

      {isSignedIn && (
        <Link href={getUrl('newArticle')} className="btn mb-6">
          Create new article
        </Link>
      )}

      <Pagination
        {...paginationProps}
        totalRows={totalRows}
        className="mb-3 justify-end"
        availableSizes={[3, 5, 10, 20]}
      />

      <table className="table table-fixed">
        <thead>
          <tr>
            <th className="w-10"></th>
            <HeaderCell {...headerCellProps} name="title" className="w-32" sortable>
              <div>Title</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="text" className="w-full" sortable>
              <div>Text</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="author.name" className="w-32" sortable>
              <div>Author</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="tags" className="w-32">
              <div>Tags</div>
            </HeaderCell>
            <th className="w-56">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(article => (
            <React.Fragment key={article.id}>
              <tr>
                <td>
                  {!isEmpty(article.comments) && (
                    <Expandbox
                      onClick={onExpandRow(article)}
                      isExpanded={isRowExpanded(article)}
                      className="p-1"
                    />
                  )}
                </td>
                <td>{article.title}</td>
                <td className="text-justify">{article.text}</td>
                <td>{article.author?.name}</td>
                <td>{article.tags?.map(tag => tag.name).join(', ')}</td>
                <td>
                  <div className="flex justify-end">
                    <Link
                      href={getUrl('article', { id: article.id })}
                      className="btn-outline btn-outline_sm  mr-2"
                    >
                      Show Article
                    </Link>
                    {isBelongsToUser(article.author_id) && (
                      <>
                        <Link
                          href={getUrl('editArticle', { id: article.id })}
                          className="btn-outline btn-outline_sm mr-2"
                        >
                          Edit Article
                        </Link>
                        <div
                          className="btn-outline btn-outline_sm"
                          onClick={deleteArticle(article.id)}
                        >
                          Remove Article
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={tableColCount} className="p-0 border-none">
                  <Collapse isHidden={!isRowExpanded(article)} minimumElHeight={85}>
                    <table className="table table_inner table-fixed">
                      <thead>
                        <tr>
                          <th className="w-28">Comments []</th>
                          <th className="w-48">Author</th>
                          <th className="w-full">Text</th>
                          <th className="w-44">Updated At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {article.comments?.map(comment => (
                          <tr key={comment.id}>
                            <td></td>
                            <td>
                              {comment.author ? (
                                <div className="flex items-center">
                                  <img
                                    src={comment.author.avatar?.path}
                                    className="w-12 mr-2"
                                    alt=""
                                  />
                                  <div>{comment.author.name}</div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <div className="w-12 mr-2 text-center">
                                    <i className="fa fa-ghost text-xl"></i>
                                  </div>
                                  <div>{comment.guest_name}</div>
                                </div>
                              )}
                            </td>
                            <td>{comment.text}</td>
                            <td>{fmtISO(comment.updated_at, 'dd MMM yyyy HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={tableColCount} className="p-0 border-none">
                            <div className="h-1.5 bg-gray-100"></div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Articles;
