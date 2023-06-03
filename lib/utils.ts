import originalAxios from 'axios';
import cookie from 'cookie';
import { isNull, isObject, isString } from 'lodash-es';
import { guestUser, isAdmin, isSignedIn } from './sharedUtils.js';
import {
  IAuthenticate,
  IGetGenericProps,
  IGetUserId,
  IHandler,
  IMixHandler,
  IOrm,
  ISwitchHttpMethod,
  IUserClass,
  IValidateFn,
  IWSSDecodeReturn,
} from './types.js';

export * from './sharedUtils.js';

export const switchHttpMethod: ISwitchHttpMethod = methods => async (req, res) => {
  const requestMethod = req.method?.toLowerCase() || '';
  if (!Object.keys(methods).includes(requestMethod))
    return res.status(404).json({ message: 'Not Found' });

  const handlers: IHandler[] = [];
  if (methods.preHandler) {
    if (typeof methods.preHandler === 'function') {
      handlers.push(methods.preHandler);
    } else {
      handlers.push(...methods.preHandler);
    }
  }

  const mixHandler: IMixHandler = methods[requestMethod];
  if (typeof mixHandler === 'function') {
    handlers.push(mixHandler);
  } else {
    handlers.push(...mixHandler);
  }

  let i = 0;
  let ctx = {} as any;
  while (!res.writableEnded && i < handlers.length) {
    const currentMiddleware = handlers[i];
    const result = await currentMiddleware(req, res, ctx);
    i += 1;
    if (isObject(result)) {
      ctx = { ...ctx, ...result };
    }
  }
};

const getYupErrors = e => {
  if (e.inner) {
    return e.inner.reduce(
      (acc, el) => ({
        ...acc,
        [el.path]: el.message,
      }),
      {}
    );
  }

  return e.message;
};

export const validate: IValidateFn =
  (schema, payloadType = 'body') =>
  async (req, res) => {
    const payload = payloadType === 'query' ? req.query : req.body;

    try {
      const validatedBody = schema.validateSync(payload, {
        abortEarly: false,
        stripUnknown: true,
      });
      return { [payloadType]: validatedBody };
    } catch (e) {
      res.status(400).json({ message: 'Input is not valid', errors: getYupErrors(e) });
    }
  };

export const makeErrors = obj => ({ errors: obj });

export const checkValueUnique = async (Enitity, column, value, excludeId: string | null = null) => {
  const existingEntities = await Enitity.query().select(column).whereNot('id', excludeId);
  if (existingEntities.some(entity => entity[column] === value)) {
    return {
      isUnique: false,
      errors: { [column]: `${column} should be unique` },
    };
  }

  return { isUnique: true, errors: null };
};

export const checkAdmin = async (req, res, ctx) => {
  if (!isAdmin(ctx.currentUser)) {
    res.status(403).json({ message: 'Forbidden' });
  }
};

export const checkSignedIn = async (req, res, ctx) => {
  if (!isSignedIn(ctx.currentUser)) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const waitForSocketState = async (socket, state) => {
  while (socket.readyState !== state) {
    await new Promise(resolve => setTimeout(resolve, 333));
  }
};

// not including "n"
export const getRandomNumUpTo = n => Math.floor(Math.random() * n);

export const decode = (message: string) => JSON.parse(message) as IWSSDecodeReturn;

export const makeWsData = (type, payload) => ({ type, payload });

export const makeNonThrowAxios = baseURL => {
  const axios = originalAxios.create({ baseURL });
  axios.interceptors.response.use(
    response => response,
    error => error.response
  );
  return axios;
};

export const sessionName = 'session';

export const getSessionValue = headers => {
  const rawCookies = headers['set-cookie'];
  if (!Array.isArray(rawCookies)) throw new Error('no cookies from server');

  const cookies = rawCookies.map(el => cookie.parse(el));
  const cookieObj = cookies.find(el => Object.keys(el).includes(sessionName));
  if (!cookieObj) throw new Error(`no '${sessionName}' cookie from server`);

  const sessionValue = cookieObj[sessionName];
  if (!isString(sessionValue)) throw new Error('no login cookie from server');

  return sessionValue;
};

export const composeValue = (value, signature) => `${value}.${signature}`;
export const decomposeValue = (compositValue: string) => {
  const values = compositValue.split('.');
  if (values.length !== 2) return [];
  return values;
};

export const setSessionCookie = (res, keygrip, userId) => {
  const signature = keygrip.sign(String(userId));
  const sessionValue = composeValue(String(userId), signature);
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(sessionName, sessionValue, { path: '/', httpOnly: true })
  );
};

export const removeSessionCookie = res => {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(sessionName, '', { path: '/', httpOnly: true, maxAge: 0 })
  );
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

export const authenticate: IAuthenticate = async (rawCookies, keygrip, fetchUser) => {
  const { userId, isSignatureCorrect } = getUserId(rawCookies, keygrip);
  if (isNull(userId)) {
    return [guestUser, false];
  } else if (!isSignatureCorrect) {
    return [guestUser, true];
  }

  const user = await fetchUser(userId);
  if (!user) return [guestUser, true];

  return [user, false];
};

export const getUserFromRequest = async (res, cookies, keygrip, User: IUserClass) => {
  // TODO: move fetchUser up, replace User parametr
  const fetchUser = async userId => User.query().findById(userId).withGraphFetched('avatar');
  const [currentUser, shouldRemoveSession] = await authenticate(cookies, keygrip, fetchUser);

  if (shouldRemoveSession) removeSessionCookie(res);

  return currentUser;
};

export const getCurrentUser = (orm: IOrm, keygrip) => async (req, res) => {
  const { User } = orm;
  const currentUser = await getUserFromRequest(res, req.cookies, keygrip, User);
  return { currentUser };
};

export const unwrap = value => JSON.parse(JSON.stringify(value));

export const getGenericProps: IGetGenericProps = async (props, otherProps: any = {}) => {
  const { ctx, keygrip, orm } = props;
  const { req, res } = ctx;
  const currentUser = await getUserFromRequest(res, req.cookies, keygrip, orm.User);
  let unreadMessages: any = [];
  if (isSignedIn(currentUser)) {
    unreadMessages = await orm.UnreadMessage.query().where('receiver_id', currentUser.id);
  }

  return unwrap({ ...otherProps, currentUser, unreadMessages });
};
