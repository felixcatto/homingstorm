import cn from 'classnames';
import { uniqueId } from 'lodash-es';
import Image from 'next/image.js';
import React from 'react';
import { IMakeNotification, IUserWithAvatar } from '../../lib/types.js';
import { getCssValue, getUrl, isTabActive, useContext, useSetGlobalState } from '../lib/utils.jsx';
import s from './Notifications.module.css';

export const Notifications = () => {
  const { useStore } = useContext();
  const setGlobalState = useSetGlobalState();
  const notifications = useStore(state => state.notifications);
  const removeNotification = useStore(state => state.removeNotification);

  React.useEffect(() => {
    const rootStyles = getComputedStyle(document.querySelector(`.${s.root}`)!);
    const animationDuration =
      getCssValue(rootStyles.getPropertyValue('--animationDuration')) * 1000;
    setGlobalState({ notificationAnimationDuration: animationDuration });
  }, []);

  React.useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    setTimeout(() => Notification.requestPermission(), 30_000);
  }, []);

  return (
    <div className={s.root}>
      {notifications.map(el => (
        <div
          key={el.id}
          className={cn(s.item, {
            [s.item_hidden]: el.isHidden,
            [s.item_inverseAnimation]: el.isInverseAnimation,
          })}
        >
          <div>
            <div className="font-bold text-primary">{el.title}</div>
            {el.text && <div className="text-justify">{el.text}</div>}
            {el.component && React.createElement(el.component)}
          </div>
          <i
            className="far fa-circle-xmark fa_big fa_link text-lg ml-2"
            onClick={() => removeNotification(el.id)}
          ></i>
        </div>
      ))}
    </div>
  );
};

export const makeNotification: IMakeNotification = opts => {
  const { title, text, component, autoremoveTimeout = 10_000 } = opts;

  const notification: any = {
    id: uniqueId(),
    title,
    isHidden: true,
    isInverseAnimation: false,
    autoremoveTimeout,
  };

  if (text) {
    return { ...notification, text };
  } else {
    return { ...notification, component };
  }
};

export const messageNotification = (sender: IUserWithAvatar) => () =>
  (
    <div className="flex items-center">
      <Image src={sender.avatar.path} width={50} height={50} alt="" />
      <div className="ml-1 text-primary font-bold">{sender.name}</div>
    </div>
  );

export const showMessageBrowserNotification = (router, sender: IUserWithAvatar) => {
  const notification = new Notification('New Message', {
    body: `From ${sender.name}`,
    icon: '/favicon.ico',
    requireInteraction: true,
  });

  notification.addEventListener('click', () => {
    window.focus();
    router.push(getUrl('messages'));
  });
};

export const showMessageNotification = (addNotification, router, sender: IUserWithAvatar) => {
  if (isTabActive()) {
    addNotification(
      makeNotification({
        title: 'New Message From',
        component: messageNotification(sender),
      })
    );
  } else {
    showMessageBrowserNotification(router, sender);
  }
};
