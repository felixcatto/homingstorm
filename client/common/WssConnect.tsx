import { useRouter } from 'next/router.js';
import React from 'react';
import {
  getApiUrl,
  getUrl,
  useContext,
  useRefreshPage,
  useSetGlobalState,
  wsEvents,
} from '../lib/utils.js';
import { onMessageEvent } from '../lib/wsActor.js';
import { showMessageNotification } from '../ui/Notifications.jsx';

const WssConnect = () => {
  const { wsActor, axios, useStore } = useContext();
  const refreshPage = useRefreshPage();
  const setGlobalState = useSetGlobalState();
  const addNotification = useStore(state => state.addNotification);
  const router = useRouter();

  React.useEffect(() => {
    wsActor.start();
  }, []);

  React.useEffect(() => {
    const updateUnreadMessages = refreshPage;

    const onMessage = onMessageEvent(async ({ type, payload }) => {
      switch (type) {
        case wsEvents.signedInUsersIds:
          setGlobalState({ signedInUsersIds: payload });
          break;

        case wsEvents.newMessagesArrived:
          if (getUrl('messages') === router.asPath) return; // we have custom logic on this page

          updateUnreadMessages();

          const { senderId } = payload;
          const sender = await axios.get(getApiUrl('user', { id: senderId }, { withAvatar: true }));
          showMessageNotification(addNotification, router, sender);
          break;

        default:
          console.log(`receive event with type "${type}", but have no handler -> ${payload}`);
          break;
      }
    });

    wsActor.onEvent(onMessage);
    return () => {
      wsActor.off(onMessage);
    };
  }, [refreshPage]);

  return null;
};

export default WssConnect;
