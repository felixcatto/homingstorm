import { memoize } from 'proxy-memoize';
import { INotification, IStoreSlice, IUserWithAvatar } from '../../lib/types.js';
import { guestUser, isAdmin, isBelongsToUser, isSignedIn } from '../lib/utils.jsx';

export const storeSlice = {
  currentUser: (initialState: IUserWithAvatar = guestUser) => initialState,

  signedInUsersIds: (initialState: number[] = []) => initialState,

  notificationAnimationDuration: (initialState = 0) => initialState,

  notifications: (initialState: INotification[] = []) => initialState,
};

export const session = memoize((state: IStoreSlice) => {
  const currentUser = state.currentUser;
  return {
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
    isBelongsToUser: isBelongsToUser(currentUser),
  };
});
