import { jest } from '@jest/globals';
import makeKeygrip from 'keygrip';
import WebSocket from 'ws';
import {
  decode,
  encode,
  makeWsData,
  makeWssUrl,
  waitForSocketState,
  wsEvents,
} from '../lib/utils.js';
import usersFixture from './fixtures/users.js';

describe('wss', () => {
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);
  const wssUrl = makeWssUrl(process.env.WSS_PORT!);

  it('reflect data', async () => {
    const socket = new WebSocket(wssUrl);
    const testMessage = 'This is a test message';
    const callback = jest.fn();
    socket.on('message', callback);

    await waitForSocketState(socket, socket.OPEN);
    callback.mockClear();
    socket.send(encode(wsEvents.echo, testMessage));
    await new Promise(resolve => setTimeout(resolve, 300));

    const data = decode(callback.mock.calls[0][0] as any);
    expect(data).toMatchObject(makeWsData(wsEvents.echo, testMessage));

    socket.close();
  });

  it('broadcast signedIn users', async () => {
    const [user] = usersFixture;
    const client1 = new WebSocket(wssUrl);
    const client2 = new WebSocket(wssUrl);

    const callback1 = jest.fn();
    const callback2 = jest.fn();
    client1.on('message', callback1);
    client2.on('message', callback2);

    await waitForSocketState(client1, client1.OPEN);
    await waitForSocketState(client2, client2.OPEN);

    callback1.mockClear();
    callback2.mockClear();
    client1.send(
      encode(wsEvents.signIn, {
        userId: user.id,
        signature: keygrip.sign(String(user.id)),
      })
    );
    await new Promise(resolve => setTimeout(resolve, 300));

    const data1 = decode(callback1.mock.calls[0][0] as any);
    const data2 = decode(callback2.mock.calls[0][0] as any);
    expect(data1).toMatchObject(makeWsData(wsEvents.signedInUsersIds, [user.id]));
    expect(data2).toMatchObject(makeWsData(wsEvents.signedInUsersIds, [user.id]));

    client1.close();
    await new Promise(resolve => setTimeout(resolve, 300));

    const data22 = decode(callback2.mock.calls[1][0] as any);
    expect(callback1.mock.calls).toHaveLength(1);
    expect(callback2.mock.calls).toHaveLength(2);
    expect(data22).toMatchObject(makeWsData(wsEvents.signedInUsersIds, []));

    client1.close();
    client2.close();
  });

  it('broadcast signedOut users', async () => {
    const [vasa, tom] = usersFixture;
    const client1 = new WebSocket(wssUrl);
    const client2 = new WebSocket(wssUrl);

    const callback1 = jest.fn();
    const callback2 = jest.fn();
    client1.on('message', callback1);
    client2.on('message', callback2);

    await waitForSocketState(client1, client1.OPEN);
    await waitForSocketState(client2, client2.OPEN);
    client1.send(
      encode(wsEvents.signIn, {
        userId: vasa.id,
        signature: keygrip.sign(String(vasa.id)),
      })
    );
    client2.send(
      encode(wsEvents.signIn, {
        userId: tom.id,
        signature: keygrip.sign(String(tom.id)),
      })
    );
    await new Promise(resolve => setTimeout(resolve, 300));
    client1.send(encode(wsEvents.signOut, { id: vasa.id }));
    await new Promise(resolve => setTimeout(resolve, 300));

    const data1 = decode(callback1.mock.lastCall![0] as any);
    const data2 = decode(callback2.mock.lastCall![0] as any);
    expect(data1).toMatchObject(makeWsData(wsEvents.signedInUsersIds, [tom.id]));
    expect(data2).toMatchObject(makeWsData(wsEvents.signedInUsersIds, [tom.id]));

    client1.close();
    client2.close();
  });

  it('notifies user about new message', async () => {
    const [vasa, tom] = usersFixture;
    const client1 = new WebSocket(wssUrl);
    const client2 = new WebSocket(wssUrl);

    const vasaCallback = jest.fn();
    const tomCallback = jest.fn();
    client1.on('message', vasaCallback);
    client2.on('message', tomCallback);

    await waitForSocketState(client1, client1.OPEN);
    await waitForSocketState(client2, client2.OPEN);
    client1.send(
      encode(wsEvents.signIn, {
        userId: vasa.id,
        signature: keygrip.sign(String(vasa.id)),
      })
    );
    client2.send(
      encode(wsEvents.signIn, {
        userId: tom.id,
        signature: keygrip.sign(String(tom.id)),
      })
    );
    await new Promise(resolve => setTimeout(resolve, 300));
    vasaCallback.mockClear();
    tomCallback.mockClear();
    client1.send(encode(wsEvents.notifyNewMessage, { receiverId: tom.id, senderId: vasa.id }));
    await new Promise(resolve => setTimeout(resolve, 300));

    expect(vasaCallback.mock.calls).toHaveLength(0);
    expect(tomCallback.mock.calls).toHaveLength(1);
    const tomData = decode(tomCallback.mock.calls[0][0] as any);
    expect(tomData).toMatchObject(makeWsData(wsEvents.newMessagesArrived, { senderId: vasa.id }));

    client1.close();
    client2.close();
  });
});
