import { IMessage, IUser, IUserWithAvatar } from '../../../lib/types.js';

type IGetUserInfoArgs = {
  messages: IMessage[];
  users: IUser[];
  currentUser: IUserWithAvatar;
  usersNewlySelectedToChat: IUser[];
};

export const getUsersInfo = ({
  messages,
  users,
  currentUser,
  usersNewlySelectedToChat,
}: IGetUserInfoArgs) => {
  const isUserHaveNoMessages = (user: IUser) =>
    messages.every(msg => msg.receiver_id !== user.id && msg.sender_id !== user.id);
  const contactsIds = new Set();

  usersNewlySelectedToChat.forEach(el => {
    if (isUserHaveNoMessages(el)) contactsIds.add(el.id);
  });
  messages.forEach(el =>
    currentUser.id === el.sender_id
      ? contactsIds.add(el.receiver_id)
      : contactsIds.add(el.sender_id)
  );

  const contacts = [...contactsIds].map(contactsId => users.find(el => el.id === contactsId)!);
  const usersAvailbleToChat = users.filter(
    el => !contactsIds.has(el.id) && el.id !== currentUser.id
  );

  return [contacts, usersAvailbleToChat];
};
