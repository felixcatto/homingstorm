import { isEmpty } from 'lodash-es';
import { compile } from 'path-to-regexp';
import avatars from './avatars.js';
import { IEncode, IMakeEnum, IMakeUrlFor } from './types.js';

export const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const roles = makeEnum('user', 'admin', 'guest');
export const asyncStates = makeEnum('idle', 'pending', 'resolved', 'rejected');
export const sortOrders = makeEnum('asc', 'desc');
export const filterTypes = makeEnum('search', 'select');

export const isSignedIn = currentUser => currentUser.role !== roles.guest;
export const isAdmin = currentUser => currentUser.role === roles.admin;
export const isBelongsToUser = currentUser => resourceAuthorId =>
  currentUser.id === resourceAuthorId || currentUser.role === roles.admin;

const [guestAvatar] = avatars;
export const guestUser = {
  id: -111,
  name: 'Guest',
  role: roles.guest,
  email: '',
  password_digest: '',
  avatar_id: guestAvatar.id,
  avatar: guestAvatar,
  isDeleted: false,
} as const;

const qs = {
  stringify: (obj = {}) => {
    if (isEmpty(obj)) return '';
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },
};

export const makeUrlFor: IMakeUrlFor = rawRoutes => {
  const routes = Object.keys(rawRoutes).reduce(
    (acc, name) => ({ ...acc, [name]: compile(rawRoutes[name]) }),
    {} as any
  );

  return (name, routeParams = {}, query = {}) => {
    const toPath = routes[name];
    return isEmpty(query) ? toPath(routeParams) : `${toPath(routeParams)}?${qs.stringify(query)}`;
  };
};

export const routes = {
  home: '/',
  users: '/users',
  user: '/users/:id',
  newUser: '/users/new',
  editUser: '/users/:id/edit',
  articles: '/articles',
  article: '/articles/:id',
  newArticle: '/articles/new',
  editArticle: '/articles/:id/edit',
  tags: '/tags',
  tag: '/tags/:id',
  newTag: '/tags/new',
  editTag: '/tags/:id/edit',
  comments: '/articles/:id/comments',
  comment: '/articles/:id/comments/:commentId',
  projectStructure: '/structure',
  session: '/session',
  newSession: '/session/new',
  messages: '/messages',
  message: '/messages/:id',
  unreadMessages: '/unread-messages',
};

export const getUrl = makeUrlFor(routes);
export const getApiUrl = (name: keyof typeof routes, routeParams?, query?) =>
  `/api${getUrl(name, routeParams, query)}`;

export const socketStates = makeEnum('unset', 'connecting', 'open', 'closed');
export const wsGeneralEvents = makeEnum('open', 'close', 'message');
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
export const encode: IEncode = (wsEvent, payload = '') =>
  JSON.stringify({ type: wsEvent, payload });

export const isBrowser = () => typeof window !== 'undefined';

export const makeWssUrl = port => {
  if (isBrowser()) {
    const { protocol, hostname } = window.location;
    return `${protocol.replace('http', 'ws')}//${hostname}:${port}`;
  }

  return `ws://localhost:${port}`;
};
