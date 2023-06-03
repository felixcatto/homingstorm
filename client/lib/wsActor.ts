import { actions, AnyActorRef, assign, createMachine, forwardTo, spawn } from 'xstate';
import { ISend, IWSDecodeReturn } from '../../lib/types';
import { decode, encode, makeEnum, wsEvents } from './utils.js';

type IEvent = keyof typeof events;
type IConnectToWss = () => WebSocket;
type IAddEventListener = (webSocket: WebSocket, event, handler) => void;
type IActorEvent = { type: typeof events.PING } | { type: typeof events.MESSAGE; data: string };
type IOnMessageCallback = (data: IWSDecodeReturn) => void;
type IWebSocketType = keyof typeof webSocketTypes;

const { stop } = actions;

export const states = makeEnum(
  'connecting',
  'connectionError',
  'open',
  'pongReceived',
  'pingSended'
);

export const events = makeEnum('CLOSE', 'OPEN', 'MESSAGE', 'SEND_MESSAGE', 'PING', 'PONG');

export const makeEvent = (event: IEvent, data) => ({ type: event, data });

export const webSocketTypes = makeEnum('browser', 'node');

const webSocketMethods = {
  [webSocketTypes.browser]: {
    addEventListener: (webSocket: WebSocket, event, handler) =>
      webSocket.addEventListener(event, handler),
    bufferToString: buffer => buffer.data.toString(),
  },
  [webSocketTypes.node]: {
    addEventListener: (webSocket, event, handler) => webSocket.on(event, handler),
    bufferToString: buffer => buffer.toString(),
  },
};

const makeWebSocketActor =
  (connectToWss: IConnectToWss, addEventListener: IAddEventListener, bufferToString) =>
  (sendBack, onReceive) => {
    const webSocket = connectToWss();

    addEventListener(webSocket, 'error', () => {});
    addEventListener(webSocket, 'open', () => sendBack(events.OPEN));
    addEventListener(webSocket, 'close', () => sendBack(events.CLOSE));
    addEventListener(webSocket, 'message', buffer => {
      const message = bufferToString(buffer);
      if (message === wsEvents.pong) {
        sendBack(events.PONG);
      } else {
        sendBack(makeEvent(events.MESSAGE, message));
      }
    });

    onReceive((e: IActorEvent) => {
      if (e.type === events.PING) {
        webSocket.send(wsEvents.ping);
      } else {
        webSocket.send(e.data);
      }
    });

    return () => webSocket.close();
  };

export const makeSocketMachine = (connectToWss, webSocketType: IWebSocketType) => {
  const { addEventListener, bufferToString } = webSocketMethods[webSocketType];
  const webSocketActor = makeWebSocketActor(connectToWss, addEventListener, bufferToString);

  return createMachine(
    {
      id: 'root',
      predictableActionArguments: true,
      initial: states.connecting,
      context: { webSocketRef: null as any as AnyActorRef },
      entry: 'startWsActor',
      states: {
        [states.connecting]: {
          on: {
            [events.OPEN]: states.open,
            [events.CLOSE]: states.connectionError,
          },
        },
        [states.connectionError]: {
          entry: 'stopWsActor',
          exit: 'startWsActor',
          after: { 3000: states.connecting },
        },
        [states.open]: {
          initial: states.pongReceived,
          invoke: { src: 'pingActor' },
          on: {
            [events.SEND_MESSAGE]: { actions: forwardTo(ctx => ctx.webSocketRef) },
            [events.CLOSE]: `#root.${states.connectionError}`,
          },
          states: {
            [states.pongReceived]: {
              on: {
                [events.PING]: {
                  target: states.pingSended,
                  actions: forwardTo(ctx => ctx.webSocketRef),
                },
              },
            },
            [states.pingSended]: {
              on: {
                [events.PING]: `#root.${states.connectionError}`,
                [events.PONG]: states.pongReceived,
              },
            },
          },
        },
      },
    },
    {
      actions: {
        startWsActor: assign({ webSocketRef: () => spawn(webSocketActor) }),
        stopWsActor: stop((ctx: any) => ctx.webSocketRef),
      },
      services: {
        pingActor: () => sendBack => {
          const id = setInterval(() => sendBack(events.PING), 60000);
          return () => clearInterval(id);
        },
      },
    }
  );
};

export const send: ISend = (wsActor, wsEvent, payload = '') => {
  const state = wsActor.getSnapshot();
  if (!state.matches(states.open)) return;

  wsActor.send(makeEvent(events.SEND_MESSAGE, encode(wsEvent, payload)));
};

export const onMessageEvent = (callback: IOnMessageCallback) => event => {
  if (events.MESSAGE === event.type) callback(decode(event.data));
};
