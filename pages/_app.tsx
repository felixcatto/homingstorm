import '../client/css/index.css'; // Import FIRST
import originalAxios from 'axios';
import { AppProps } from 'next/app';
import React from 'react';
import { interpret } from 'xstate';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import WssConnect from '../client/common/WssConnect.js';
import makeActions from '../client/globalStore/actions.js';
import { storeSlice } from '../client/globalStore/store.js';
import { Context, guestUser, makeWssUrl } from '../client/lib/utils.js';
import { makeSocketMachine, webSocketTypes } from '../client/lib/wsActor.js';
import { IContext, IPageProps } from '../lib/types.js';
import '../client/css/tailwind.css'; // Import LAST

function App(appProps: AppProps<IPageProps>) {
  const { Component, pageProps } = appProps;
  const { unreadMessages } = pageProps;
  const staticStore = React.useMemo(() => {
    const currentUser = pageProps.currentUser || guestUser;
    if (!pageProps.currentUser) {
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

    const connectToWss = () => new WebSocket(makeWssUrl(process.env.NEXT_PUBLIC_WSS_PORT!));
    const wsActor: any = interpret(makeSocketMachine(connectToWss, webSocketTypes.browser));

    return {
      axios,
      wsActor,
      useStore,
    };
  }, []);

  const store: IContext = { ...staticStore, unreadMessages };

  return (
    <Context.Provider value={store}>
      <WssConnect />
      <Component {...pageProps} />
    </Context.Provider>
  );
}

export default App;
