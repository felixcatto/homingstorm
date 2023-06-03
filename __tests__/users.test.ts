import { omit } from 'lodash-es';
import { orm } from '../lib/init.js';
import { encrypt } from '../lib/secure.js';
import { getApiUrl, getUrl, makeNonThrowAxios } from '../lib/utils.js';
import avatarsFixture from './fixtures/avatars.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('users', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);
  const { User, Avatar } = orm;
  let loginOptions;

  beforeAll(async () => {
    const [admin] = usersFixture;
    await Avatar.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
    await User.query().delete();
    await User.query().insert(admin as any);
    loginOptions = await getLoginOptions(axios);
  });

  beforeEach(async () => {
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('GET /users', async () => {
    const res = await axios.get(getUrl('users'));
    expect(res.status).toBe(200);
  });

  it('GET /api/users/:id/edit', async () => {
    const [user] = usersFixture;
    const res = await axios.get(getApiUrl('user', { id: user.id }));
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(omit(user, 'password'));
  });

  it('POST /api/users without admin rights', async () => {
    const res = await axios.post(getApiUrl('users'), { vasa: 'eto boroda' });
    expect(res.status).toBe(403);
  });

  it('POST /api/users', async () => {
    const user = {
      name: 'boris',
      role: 'admin',
      email: 'boris@yandex.ru',
      password: '1',
    };

    const res = await axios.post(getApiUrl('users'), user, loginOptions);

    const userFromDb = await User.query().findOne('name', user.name);
    const expectedUser = {
      ...omit(user, 'password'),
      password_digest: encrypt(user.password),
    };

    expect(res.status).toBe(201);
    expect(userFromDb).toMatchObject(expectedUser);
  });

  it('POST /api/users (unique email)', async () => {
    const user = omit(usersFixture[0], 'id');
    const res = await axios.post(getApiUrl('users'), user, loginOptions);
    expect(res.status).toBe(400);
  });

  it('PUT /api/users/:id', async () => {
    const user = {
      ...usersFixture[0],
      role: 'guest',
    };
    const res = await axios.put(getApiUrl('user', { id: user.id }), user, loginOptions);

    const userFromDb = await User.query().findOne('name', user.name);
    const expectedUser = omit(user, 'password');
    expect(res.status).toBe(201);
    expect(userFromDb).toMatchObject(expectedUser);
  });

  it('DELETE /api/users/:id', async () => {
    const [user] = usersFixture;
    const res = await axios.delete(getApiUrl('user', { id: user.id }), loginOptions);

    const userFromDb = await User.query().findById(user.id);
    expect(res.status).toBe(201);
    expect(userFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
