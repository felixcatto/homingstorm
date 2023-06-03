import { orm } from '../lib/init.js';
import { getApiUrl, makeNonThrowAxios } from '../lib/utils.js';
import avatarsFixture from './fixtures/avatars.js';
import messagesFixture from './fixtures/messages.js';
import usersFixture from './fixtures/users.js';
import { getLoginOptions } from './fixtures/utils.js';

describe('messages', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = makeNonThrowAxios(baseURL);
  const { User, Message, Avatar } = orm;
  let loginOptions;

  beforeAll(async () => {
    await Avatar.query().delete();
    await User.query().delete();
    await Avatar.query().insertGraph(avatarsFixture);
    await User.query().insertGraph(usersFixture as any);
    loginOptions = await getLoginOptions(axios);
  });

  beforeEach(async () => {
    await Message.query().delete();
    await Message.query().insertGraph(messagesFixture);
  });

  it('GET /api/messages', async () => {
    const res = await axios.get(getApiUrl('messages'));
    const messagesFromDb = await Message.query();
    expect(res.status).toBe(200);
    expect(messagesFromDb).toMatchObject(messagesFixture);
  });

  it('POST /api/messages', async () => {
    const message = {
      text: 'ggwp lanaya',
      receiver_id: -3,
    };
    const res = await axios.post(getApiUrl('messages'), message, loginOptions);

    const messageFromDb = await Message.query().findOne('text', message.text);
    expect(res.status).toBe(201);
    expect(messageFromDb).toMatchObject(message);
  });

  it("POST /api/messages can't send messages to unexisted users", async () => {
    const message = {
      text: 'ggwp lanaya',
      receiver_id: -333,
    };
    const res = await axios.post(getApiUrl('messages'), message, loginOptions);
    expect(res.status).toBe(400);
  });

  it('PUT /api/messages cant edit other people messages', async () => {
    const [vasaMessage] = messagesFixture;
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.put(
      getApiUrl('message', { id: vasaMessage.id }),
      vasaMessage,
      tomLoginOptions
    );
    expect(res.status).toBe(403);
  });

  it('PUT /api/messages/:id', async () => {
    const tomsMessage = messagesFixture[1];
    const message = {
      ...tomsMessage,
      text: '(edited)',
    };
    const [, tomUser] = usersFixture;
    const tomLoginOptions = await getLoginOptions(axios, tomUser);
    const res = await axios.put(getApiUrl('message', { id: message.id }), message, tomLoginOptions);

    const messageFromDb = await Message.query().findById(message.id);
    expect(messageFromDb).toMatchObject(message);
    expect(res.status).toBe(201);
  });

  it('DELETE /api/messages/:id', async () => {
    const [message] = messagesFixture;
    const res = await axios.delete(getApiUrl('message', { id: message.id }), loginOptions);
    const messageFromDb = await Message.query().findById(message.id);
    expect(res.status).toBe(201);
    expect(messageFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await orm.knex.destroy();
  });
});
