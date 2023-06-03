import { orm } from '../lib/init.js';
import { getApiUrl, getUrl, makeNonThrowAxios } from '../lib/utils.js';
import articlesFixture from './fixtures/articles.js';
import articleTagsFixture from './fixtures/articles_tags.js';
import avatarsFixture from './fixtures/avatars.js';
import tagsFixture from './fixtures/tags.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('articles', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);
  const { User, Tag, Article, Avatar, knex } = orm;
  let loginOptions;

  beforeAll(async () => {
    await Avatar.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
    await User.query().delete();
    await Tag.query().delete();
    await User.query().insertGraph(usersFixture as any);
    await Tag.query().insertGraph(tagsFixture as any);
    loginOptions = await getLoginOptions(axios);
  });

  beforeEach(async () => {
    await knex.delete().from('articles_tags');
    await Article.query().delete();
    await Article.query().insertGraph(articlesFixture);
    await knex.insert(articleTagsFixture).into('articles_tags');
  });

  it('GET /articles', async () => {
    const res = await axios.get(getUrl('articles'));
    expect(res.status).toBe(200);
  });

  it('GET /articles/new', async () => {
    const res = await axios.get(getUrl('newArticle'));
    expect(res.status).toBe(200);
  });

  it('GET /articles/-1/edit', async () => {
    const res = await axios.get(getUrl('editArticle', { id: '-1' }));
    expect(res.status).toBe(200);
  });

  it('GET /articles/:id', async () => {
    const [article] = articlesFixture;
    const res = await axios.get(getUrl('article', { id: article.id }));
    expect(res.status).toBe(200);
  });

  it('GET /api/articles/:id', async () => {
    const [article] = articlesFixture;
    const res = await axios.get(getApiUrl('article', { id: article.id }));
    const articleFromDb = await Article.query().findById(article.id);
    expect(res.status).toBe(200);
    expect(articleFromDb).toMatchObject(article);
  });

  it('POST /api/articles - with tags', async () => {
    const tagIds = tagsFixture.map(tag => tag.id);
    const article = {
      title: 'test2',
      text: 'test2',
      tagIds,
    };
    const res = await axios.post(getApiUrl('articles'), article, loginOptions);

    const articleFromDb = await Article.query()
      .findOne('title', article.title)
      .withGraphFetched('tags');
    expect(res.status).toBe(201);
    expect(articleFromDb).toMatchObject(article);
  });

  it('PUT /api/articles/:id - article does not belong to user', async () => {
    const [vasaArticle] = articlesFixture;
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.put(
      getApiUrl('article', { id: vasaArticle.id }),
      vasaArticle,
      tomLoginOptions
    );
    expect(res.status).toBe(403);
  });

  it('PUT /api/articles/:id - with tags', async () => {
    const tomsArticle = articlesFixture[2];
    const article = {
      ...tomsArticle,
      tagIds: [-1, -3],
      title: '(edited)',
    };
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.put(getApiUrl('article', { id: article.id }), article, tomLoginOptions);

    const articleFromDb = await Article.query().findById(article.id).withGraphFetched('tags');
    expect(articleFromDb).toMatchObject(article);
    expect(res.status).toBe(201);
  });

  it('DELETE /api/articles/:id', async () => {
    const [article] = articlesFixture;
    const res = await axios.delete(getApiUrl('article', { id: article.id }), loginOptions);

    const articleFromDb = await Article.query().findById(article.id);
    expect(res.status).toBe(201);
    expect(articleFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
