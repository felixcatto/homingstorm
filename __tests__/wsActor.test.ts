import { WebSocket, WebSocketServer } from 'ws';
import { interpret } from 'xstate';
import { makeSocketMachine, states, webSocketTypes } from '../client/lib/wsActor.js';
import { makeWssUrl } from '../lib/utils.js';

const startServer = async port =>
  new Promise(resolve => {
    const wss = new WebSocketServer({ port });
    const closeServer = async () => new Promise<void>(resolve => wss.close(() => resolve()));

    wss.on('listening', () => resolve(closeServer));
    wss.on('connection', ws => {
      ws.on('message', () => {});
    });
  });

describe('wss', () => {
  const wssPort = 3005;
  const wssUrl = makeWssUrl(wssPort);

  let closeServer;
  const connectToWss = () => new WebSocket(wssUrl);
  const makeWsActor = () => interpret(makeSocketMachine(connectToWss, webSocketTypes.node));

  beforeEach(async () => {
    closeServer = await startServer(wssPort);
  });

  it('connects successfully', async () => {
    const wsActor = makeWsActor();
    wsActor.start();

    await new Promise(resolve => setTimeout(resolve, 300));
    wsActor.stop();

    const receivedState = wsActor.getSnapshot().value;
    expect(receivedState).toEqual({ [states.open]: states.pongReceived });
  });

  it('auto reconnects if first attempt fails', async () => {
    await closeServer();
    const wsActor = makeWsActor();
    wsActor.start();
    await new Promise(resolve => setTimeout(resolve, 300));

    const receivedState = wsActor.getSnapshot().value;
    expect(receivedState).toEqual(states.connectionError);

    closeServer = await startServer(wssPort);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const receivedState2 = wsActor.getSnapshot().value;
    wsActor.stop();
    expect(receivedState2).toEqual({ [states.open]: states.pongReceived });
  });

  afterEach(async () => closeServer());
});
