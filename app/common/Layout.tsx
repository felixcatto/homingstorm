import cn from 'classnames';
import { IDeleteSessionResponse } from 'lib/types';
import { isEmpty } from 'lodash';
import { session } from '../globalStore/store';
import {
  Link,
  NavLink,
  getApiUrl,
  getUrl,
  guestUser,
  popoverRootId,
  tooltipRootId,
  useContext,
  useSetGlobalState,
  userRolesToIcons,
  wsEvents,
} from '../lib/utils';
import { send } from '../lib/wsActor';
import { Notifications } from '../ui/Notifications';
import s from './Layout.module.css';

const Layout = ({ children }: any) => {
  const { unreadMessages, useStore, axios, wsActor } = useContext();
  const setGlobalState = useSetGlobalState();
  const { currentUser, isSignedIn } = useStore(session);

  const signOut = async () => {
    const { currentUser, signOutUserId } = await axios.delete<IDeleteSessionResponse>(
      getUrl('session')
    );

    setGlobalState({ currentUser });
    send(wsActor, wsEvents.signOut, { id: signOutUserId });
  };

  const userIconClass = role => cn(s.userRoleIcon, 'mr-1', userRolesToIcons[role]);

  return (
    <>
      <div className={s.app}>
        <div className={s.header}>
          <div className={cn('container', s.headerFg)}>
            <div className="flex items-center">
              <img src="/img/storm.svg" className={cn('mr-7', s.logoImg)} alt="" />
              <div className="flex">
                <NavLink href={getUrl('home')}>Home</NavLink>
                <NavLink href={getUrl('users')}>Users</NavLink>
              </div>
            </div>
            {isSignedIn ? (
              <div className="flex items-center">
                <div className="flex items-center mr-1">
                  <i className={userIconClass(currentUser.role)}></i>
                  <div data-test="userName">{currentUser.name}</div>
                  <div className="ml-1 flex-none">
                    <img src={currentUser.avatar.path} width={48} height={48} alt="" />
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
