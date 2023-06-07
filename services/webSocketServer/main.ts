import fastifyWs from '@fastify/websocket';
import cookie from 'cookie';
import fy, { FastifyInstance } from 'fastify';
import makeKeygrip from 'keygrip';
import { IEncode, IGetUserId, IMakeEnum, IWSSDecodeReturn } from 'lib/types';
import { isObject, isString, omit } from 'lodash';
import { WebSocket } from 'ws';

export const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const decode = (message: string) => JSON.parse(message) as IWSSDecodeReturn;

export const encode: IEncode = (wsEvent, payload = '') =>
  JSON.stringify({ type: wsEvent, payload });

export const wsEvents = makeEnum(
  'error',
  'echo',
  'ping',
  'pong',
  'signIn',
  'signOut',
  'signedInUsersIds',
  'getSignedInUsersIds',
  'notifyNewMessage',
  'newMessagesArrived'
);

export const sessionName = 'session';

export const decomposeValue = (compositValue: string) => {
  const values = compositValue.split('.');
  if (values.length !== 2) return [];
  return values;
};

export const getUserId: IGetUserId = (rawCookies, keygrip) => {
  let cookies;
  if (isString(rawCookies)) {
    cookies = cookie.parse(rawCookies);
  } else if (isObject(rawCookies)) {
    cookies = rawCookies;
  } else {
    return { userId: null, isSignatureCorrect: false };
  }

  const sessionValue = cookies[sessionName];
  if (!sessionValue) return { userId: null, isSignatureCorrect: false };

  const [userId, signature] = decomposeValue(sessionValue);
  if (!userId || !signature) return { userId, isSignatureCorrect: false };

  return { userId, isSignatureCorrect: keygrip.verify(userId, signature) };
};

type ISignedInUsers = {
  [userId: string]: {
    userId: number;
    socket: WebSocket;
  };
};

const wss = async (fastify: FastifyInstance) => {
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);

  let signedInUsers: ISignedInUsers = {};
  const getUsersIds = () => Object.values(signedInUsers).map(el => el.userId);

  fastify.get('/', { websocket: true }, (connection, req) => {
    console.log('wss: client connected');
    const broadcast = (eventType, payload) => {
      fastify.websocketServer.clients.forEach(socket => {
        socket.send(encode(eventType, payload));
      });
    };

    const userInfo = getUserId(req.headers.cookie, keygrip);
    if (userInfo.isSignatureCorrect) {
      const userId = Number(userInfo.userId);
      signedInUsers[userId] = { userId, socket: connection.socket };
      broadcast(wsEvents.signedInUsersIds, getUsersIds());
    } else {
      connection.socket.send(encode(wsEvents.signedInUsersIds, getUsersIds()));
    }

    connection.socket.on('message', msgBuffer => {
      const message = msgBuffer.toString();
      if (message === wsEvents.ping) {
        return connection.socket.send(wsEvents.pong);
      }

      const { type, payload } = decode(message);
      switch (type) {
        case wsEvents.echo:
          connection.socket.send(encode(wsEvents.echo, payload));
          break;
        case wsEvents.signIn:
          const { userId, signature } = payload;
          const isSignatureCorrect = keygrip.verify(String(userId), signature);

          if (isSignatureCorrect) {
            signedInUsers[userId] = { userId, socket: connection.socket };
            broadcast(wsEvents.signedInUsersIds, getUsersIds());
          }
          break;
        case wsEvents.signOut:
          const { id } = payload;
          signedInUsers = omit(signedInUsers, id);
          broadcast(wsEvents.signedInUsersIds, getUsersIds());
          break;
        case wsEvents.getSignedInUsersIds:
          connection.socket.send(encode(wsEvents.signedInUsersIds, getUsersIds()));
          break;
        case wsEvents.notifyNewMessage:
          const { receiverId, senderId } = payload;
          const receiverSocket = signedInUsers[receiverId]?.socket;
          if (!receiverSocket) return;
          receiverSocket.send(encode(wsEvents.newMessagesArrived, { senderId }));
          break;
        default:
          connection.socket.send(
            encode(wsEvents.error, `message with type "${type}" is not supported`)
          );
      }
    });

    connection.socket.on('close', () => {
      console.log('wss: client disconnected');
      const userInfo = Object.values(signedInUsers).find(el => el.socket === connection.socket);
      const userId = userInfo?.userId;
      if (userId) {
        signedInUsers = omit(signedInUsers, userId);
        broadcast(wsEvents.signedInUsersIds, getUsersIds());
      }
    });
  });
};

const healthCheck = async (fastify: FastifyInstance) => {
  fastify.get('/health', async (requst, reply) => reply.code(200).send('hi'));
};

const fastify = fy();
fastify.register(fastifyWs, {
  errorHandler: (error, conn) => {
    console.log(error);
    conn.destroy(error);
  },
  options: { clientTracking: true },
});
fastify.register(wss);
fastify.register(healthCheck);

export const startServer = async (opts?) =>
  new Promise(resolve => {
    const port = opts?.port || process.env.WSS_PORT;
    fastify.listen({ port, host: '0.0.0.0' }, err => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      resolve(fastify);
    });
  });

export const closeServer = async () => fastify.close();
