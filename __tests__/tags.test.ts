import { orm } from '../lib/init.js';
import { getApiUrl, getUrl, makeNonThrowAxios } from '../lib/utils.js';
import avatarsFixture from './fixtures/avatars.js';
import tagsFixture from './fixtures/tags.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('tags', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);
  const { User, Tag, Avatar } = orm;
  let loginOptions;

  beforeAll(async () => {
    await Avatar.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
    loginOptions = await getLoginOptions(axios);
  });

  beforeEach(async () => {
    await Tag.query().delete();
    await Tag.query().insertGraph(tagsFixture as any);
  });

  it('GET /tags', async () => {
    const res = await axios.get(getUrl('tags'));
    expect(res.status).toBe(200);
  });

  it('GET /tags/:id/edit', async () => {
    const [tag] = tagsFixture;
    const res = await axios.get(getUrl('editTag', { id: tag.id }));
    expect(res.status).toBe(200);
  });

  it('GET /api/tags', async () => {
    const res = await axios.get(getApiUrl('tags'));
    const tagsFromDb = await Tag.query();
    expect(res.status).toBe(200);
    expect(tagsFromDb).toMatchObject(res.data);
  });

  it('GET /api/tags/:id/edit', async () => {
    const [tag] = tagsFixture;
    const res = await axios.get(getApiUrl('tag', { id: tag.id }));
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(tag);
  });

  it('POST /api/tags', async () => {
    const tag = { name: 'test' };
    const res = await axios.post(getApiUrl('tags'), tag, loginOptions);
    const tagFromDb = await Tag.query().findOne('name', tag.name);
    expect(res.status).toBe(201);
    expect(tagFromDb).toMatchObject(tag);
  });

  it('PUT /api/tags/:id', async () => {
    const tag = {
      ...tagsFixture[0],
      name: '(edited)',
    };
    const res = await axios.put(getApiUrl('tag', { id: tag.id }), tag, loginOptions);
    const tagFromDb = await Tag.query().findById(tag.id);
    expect(res.status).toBe(201);
    expect(tagFromDb).toMatchObject(tag);
  });

  it('DELETE /api/tags/:id', async () => {
    const [tag] = tagsFixture;
    const res = await axios.delete(getApiUrl('tag', { id: tag.id }), loginOptions);
    const tagFromDb = await Tag.query().findById(tag.id);
    expect(res.status).toBe(201);
    expect(tagFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
