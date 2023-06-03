import { isEmpty } from 'lodash-es';
import { compile } from 'path-to-regexp';

type IMakeUrlFor = <T extends object>(rawRoutes: T) => (name: keyof T, args?, opts?) => string;

const qs = {
  stringify: (obj = {}) => {
    if (isEmpty(obj)) return '';
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },
};

const makeUrlFor: IMakeUrlFor = rawRoutes => {
  const routes = Object.keys(rawRoutes).reduce(
    (acc, name) => ({ ...acc, [name]: compile(rawRoutes[name]) }),
    {} as any
  );

  return (name, routeParams = {}, query = {}) => {
    const toPath = routes[name];
    return isEmpty(query) ? toPath(routeParams) : `${toPath(routeParams)}?${qs.stringify(query)}`;
  };
};

const routes = {
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
