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

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverModuleFormat: 'cjs',
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },

  postcss: true,
  tailwind: true,
  serverDependenciesToBundle: ['axios'],
  routes: defineRoutes =>
    defineRoutes(route => {
      route(routes.home, 'pages/index.tsx');
      route(routes.session, 'pages/session/index.tsx');
      route(routes.newSession, 'pages/session/new.tsx');
      route(routes.users, 'pages/users/index.tsx');
      route(routes.user, 'pages/users/$id.tsx');
      route(routes.newUser, 'pages/users/new.tsx');
      route(routes.editUser, 'pages/users/$id.edit.tsx');
    }),
};
