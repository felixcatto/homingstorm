import { omit } from 'lodash-es';
import { keygrip, orm } from '../lib/init.js';
import {
  authenticate,
  composeValue,
  decomposeValue,
  getApiUrl,
  getSessionValue,
  guestUser,
  makeNonThrowAxios,
} from '../lib/utils.js';
import avatarsFixture from './fixtures/avatars.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('session', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);

  const { User, Avatar } = orm;
  const fetchUser = async userId => User.query().findById(userId);

  beforeAll(async () => {
    await Avatar.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
  });

  beforeEach(async () => {
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('authentificates user', async () => {
    const [user] = usersFixture;
    const signature = keygrip.sign(String(user.id));
    const rawCookies = `session=${composeValue(user.id, signature)}`;
    const [receivedUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);
    expect(receivedUser).toMatchObject(omit(user, 'password'));
    expect(shouldRemoveSession).toBeFalsy();
  });

  it('fails authentificate if signature incorrect', async () => {
    const [user] = usersFixture;
    const signature = keygrip.sign(String(user.id));
    const falseSignature = `x${signature.slice(1)}`;
    const rawCookies = `session=${composeValue(user.id, falseSignature)}`;
    const [receivedUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);

    expect(receivedUser).toMatchObject(guestUser);
    expect(shouldRemoveSession).toBeTruthy();
  });

  it('GET /api/session', async () => {
    const [admin] = usersFixture;
    const loginOptions = await getLoginOptions(axios);
    const res = await axios.get(getApiUrl('session'), loginOptions);
    const signature = keygrip.sign(String(admin.id));
    expect(res.data).toMatchObject({ userId: admin.id, signature });
  });

  it('POST /api/session', async () => {
    const [vasa] = usersFixture;
    const res = await axios.post(getApiUrl('session'), vasa);

    const sessionValue = getSessionValue(res.headers);
    const [userId] = decomposeValue(sessionValue);

    expect(res.status).toEqual(201);
    expect(userId).toEqual(String(vasa.id));
  });

  it('DELETE /api/session', async () => {
    const res = await axios.delete(getApiUrl('session'));

    const sessionValue = getSessionValue(res.headers);

    expect(res.status).toEqual(201);
    expect(sessionValue).toEqual('');
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
