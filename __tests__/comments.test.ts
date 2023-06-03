import { orm } from '../lib/init.js';
import { getApiUrl, makeNonThrowAxios } from '../lib/utils.js';
import articlesFixture from './fixtures/articles.js';
import avatarsFixture from './fixtures/avatars.js';
import commentsFixture from './fixtures/comments.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('articles', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);
  const { User, Comment, Article, Avatar } = orm;
  let loginOptions;

  beforeAll(async () => {
    await Avatar.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
    await User.query().delete();
    await Article.query().delete();
    await User.query().insertGraph(usersFixture as any);
    await Article.query().insertGraph(articlesFixture as any);
    loginOptions = await getLoginOptions(axios);
  });

  beforeEach(async () => {
    await Comment.query().delete();
    await Comment.query().insertGraph(commentsFixture);
  });

  it('GET /api/articles/:id/comments/:id', async () => {
    const [comment] = commentsFixture;
    const res = await axios.get(
      getApiUrl('comment', { id: comment.article_id, commentId: comment.id })
    );
    const commentFromDb = await Comment.query().findById(comment.id);
    expect(res.status).toBe(200);
    expect(commentFromDb).toMatchObject(comment);
  });

  it('POST /api/articles/:id/comments', async () => {
    const comment = {
      guest_name: 'guest_name',
      text: 'text',
    };
    const articleId = -1;
    const res = await axios.post(getApiUrl('comments', { id: articleId }), comment);
    const commentFromDb = await Comment.query()
      .findOne('guest_name', comment.guest_name)
      .withGraphFetched('article');

    expect(res.status).toBe(201);
    expect(commentFromDb).toMatchObject(comment);
    expect(commentFromDb?.article?.id).toBe(articleId);
  });

  it('PUT /api/articles/:id/comments/:id - comment does not belong to user', async () => {
    const vasaComment = {
      ...commentsFixture[0],
      text: '(edited)',
    };
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.put(
      getApiUrl('comment', { id: vasaComment.article_id, commentId: vasaComment.id }),
      vasaComment,
      tomLoginOptions
    );
    expect(res.status).toBe(403);
  });

  it('PUT /api/articles/:id/comments/:commentId', async () => {
    const comment = {
      ...commentsFixture[0],
      text: '(edited)',
    };
    const res = await axios.put(
      getApiUrl('comment', { id: comment.article_id, commentId: comment.id }),
      comment,
      loginOptions
    );

    const commentFromDb = await Comment.query().findById(comment.id);
    expect(res.status).toBe(201);
    expect(commentFromDb).toMatchObject(comment);
  });

  it('DELETE /api/articles/:id/comments/:id - comment does not belong to user', async () => {
    const [vasaComment] = commentsFixture;
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.delete(
      getApiUrl('comment', { id: vasaComment.article_id, commentId: vasaComment.id }),
      tomLoginOptions
    );
    expect(res.status).toBe(403);
  });

  it('DELETE /api/articles/:id/comments/:id', async () => {
    const [comment] = commentsFixture;
    const res = await axios.delete(
      getApiUrl('comment', { id: comment.article_id, commentId: comment.id }),
      loginOptions
    );

    const commentFromDb = await Comment.query().findById(comment.id);
    expect(res.status).toBe(201);
    expect(commentFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
