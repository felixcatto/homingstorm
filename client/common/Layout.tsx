import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { IDeleteSessionResponse } from '../../lib/types.js';
import { session } from '../globalStore/store.js';
import {
  NavLink,
  getApiUrl,
  getUrl,
  popoverRootId,
  tooltipRootId,
  useContext,
  useSetGlobalState,
  userRolesToIcons,
  wsEvents,
} from '../lib/utils.js';
import { send } from '../lib/wsActor.js';
import { Notifications } from '../ui/Notifications.jsx';
import s from './Layout.module.css';

const Layout = ({ children }: any) => {
  const { unreadMessages, useStore, axios, wsActor } = useContext();
  const setGlobalState = useSetGlobalState();
  const { currentUser, isSignedIn } = useStore(session);

  const signOut = async () => {
    const { currentUser, signOutUserId } = await axios.delete<IDeleteSessionResponse>(
      getApiUrl('session')
    );

    setGlobalState({ currentUser });
    send(wsActor, wsEvents.signOut, { id: signOutUserId });
  };

  const userIconClass = role => cn(s.userRoleIcon, 'mr-1', userRolesToIcons[role]);

  return (
    <>
      <Head>
        <title>Homing Storm</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.app}>
        <div className={s.header}>
          <div className={cn('container', s.headerFg)}>
            <div className="flex items-center">
              <Image
                src="/img/storm.svg"
                className={cn('mr-7', s.logoImg)}
                width={66}
                height={48}
                alt=""
              />
              <div className="flex">
                <NavLink href={getUrl('home')}>Home</NavLink>
                <NavLink href={getUrl('users')}>Users</NavLink>
                <NavLink href={getUrl('articles')}>Articles</NavLink>
                <NavLink href={getUrl('tags')}>Tags</NavLink>
                {isSignedIn && (
                  <div className={s.messagesWrap}>
                    <NavLink href={getUrl('messages')} data-test="messagesNavLink">
                      Messages
                    </NavLink>
                    {!isEmpty(unreadMessages) && (
                      <div className={cn('msg-count', s.unreadMessageCount)}>
                        {unreadMessages.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isSignedIn ? (
              <div className="flex items-center">
                <div className="flex items-center mr-1">
                  <i className={userIconClass(currentUser.role)}></i>
                  <div data-test="userName">{currentUser.name}</div>
                  <div className="ml-1 flex-none">
                    <Image src={currentUser.avatar.path} width={48} height={48} alt="" />
                  </div>
                </div>
                <i
                  className={cn('fa fa-sign-out-alt', s.signIcon)}
                  title="Sign out"
                  onClick={signOut}
                  data-test="signOutLink"
                ></i>
              </div>
            ) : (
              <Link href={getUrl('newSession')} className={s.signIn} data-test="signInLink">
                <div className={s.signInText}>Sign In</div>
                <i className={cn('fa fa-sign-in-alt', s.signIcon)} title="Sign in"></i>
              </Link>
            )}
          </div>
        </div>
        <div className={cn('container', s.content)}>{children}</div>
      </div>
      <div id={tooltipRootId}></div>
      <div id={popoverRootId}></div>
      <Notifications />
    </>
  );
};

export default Layout;