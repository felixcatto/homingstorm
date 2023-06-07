import { json } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import cn from 'classnames';
import { orm } from '../../../lib/init';
import { IUser } from '../../../lib/types';
import Layout from '../../common/Layout';
import { session } from '../../globalStore/store';
import { Link, getUrl, useContext, usePendingValues, userRolesToIcons } from '../../lib/utils';
import s from './styles.module.css';

type IData = {
  users: IUser[];
};

export const loader = async () => {
  const users = await orm.User.query();
  return json({ users });
};

const Users = () => {
  const revalidator = useRevalidator();
  const { users } = useLoaderData<IData>();
  const { useStore, axios } = useContext();
  const signedInUsersIds = useStore(state => state.signedInUsersIds);
  const { isAdmin } = useStore(session);

  const [removeUser, userIdsToRemove] = usePendingValues(
    id => axios.delete(getUrl('user', { id })),
    revalidator.revalidate
  );

  const onlineIconClass = userId =>
    cn('online-icon mx-auto', {
      ['online-icon_online']: signedInUsersIds.includes(userId),
    });
  const removeUserBtnClass = userId =>
    cn('btn-outline btn-outline_sm', {
      'btn-outline_disabled': userIdsToRemove.includes(userId),
    });

  return (
    <Layout>
      <h3>Users List</h3>

      {isAdmin && (
        <Link href={getUrl('newUser')} className="btn mb-6">
          Create new user
        </Link>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            {isAdmin && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className={s.isOnlineCell}>
                <i className={onlineIconClass(user.id)}></i>
              </td>
              <td>{user.name}</td>
              <td>
                <div className="flex items-center">
                  <i className={cn('mr-1', userRolesToIcons[user.role])}></i>
                  <div>{user.role}</div>
                </div>
              </td>
              <td>{user.email}</td>
              {isAdmin && (
                <td>
                  <div className="flex justify-end">
                    <Link
                      href={getUrl('editUser', { id: user.id })}
                      className="btn-outline btn-outline_sm mr-2"
                    >
                      Edit user
                    </Link>
                    <div className={removeUserBtnClass(user.id)} onClick={removeUser(user.id)}>
                      Remove user
                    </div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Users;
