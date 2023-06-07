import './css/index.css'; // Import FIRST
import { cssBundleHref } from '@remix-run/css-bundle';
import { LinksFunction, LoaderArgs, json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import originalAxios from 'axios';
import { keygrip, orm } from 'lib/init';
import { getCurrentUser, isSignedIn } from 'lib/utils';
import React from 'react';
import { interpret } from 'xstate';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { IContext, IUserWithAvatar } from '../lib/types';
import WssConnect from './common/WssConnect';
import makeActions from './globalStore/actions';
import { storeSlice } from './globalStore/store';
import { Context, guestUser, makeWssUrl } from './lib/utils';
import { makeSocketMachine, webSocketTypes } from './lib/wsActor';
import './css/tailwind.css'; // Import LAST

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderArgs) => {
  const { currentUser } = await getCurrentUser(orm, keygrip, request.headers);

  let unreadMessages: any = [];
  if (isSignedIn(currentUser)) {
    unreadMessages = await orm.UnreadMessage.query().where('receiver_id', currentUser.id);
  }

  return json({
    ENV: { PUBLIC_WSS_PORT: process.env.PUBLIC_WSS_PORT },
    unreadMessages,
    currentUser,
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const { unreadMessages, ENV } = data;

  const staticStore = React.useMemo(() => {
    const currentUser = (data.currentUser || guestUser) as IUserWithAvatar;
    if (!data.currentUser) {
      console.warn('beware, no currentUser detected');
    }

    const axios = originalAxios.create();
    axios.interceptors.response.use(
      response => response.data,
      error => {
        console.log(error.response);
        return Promise.reject(error);
      }
    );

    const store = Object.keys(storeSlice).reduce((acc, key) => {
      const makeFn = storeSlice[key];
      return { ...acc, [key]: makeFn() };
    }, {});

    const useStore = create<any>(
      immer((set, get) => ({
        setGlobalState: set,
        ...makeActions(set, get),
        ...store,
        currentUser: storeSlice.currentUser(currentUser),
      }))
    );

    const connectToWss = () => new WebSocket(makeWssUrl(window.ENV.PUBLIC_WSS_PORT));
    const wsActor: any = interpret(makeSocketMachine(connectToWss, webSocketTypes.browser));

    return {
      axios,
      wsActor,
      useStore,
    };
  }, []);

  const store: IContext = { ...staticStore, unreadMessages };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          rel="preload"
          href="/font/SourceSansProL.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/font/SourceSansProR.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
        <link rel="preload" href="/img/s2.jpg" as="image" />
        <link
          rel="preload"
          href="/font/fa-regular-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/font/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <Meta />
        <Links />
        <title>Homingstorm</title>
      </head>
      <body>
        <Context.Provider value={store}>
          <WssConnect />
          <Outlet />
        </Context.Provider>

        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
