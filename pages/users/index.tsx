import cn from 'classnames';
import Link from 'next/link';
import Layout from '../../client/common/Layout.js';
import { session } from '../../client/globalStore/store.js';
import {
  dedup,
  getApiUrl,
  getUrl,
  useContext,
  useRefreshPage,
  userRolesToIcons,
} from '../../client/lib/utils.js';
import { keygrip, orm } from '../../lib/init.js';
import { IUser } from '../../lib/types.js';
import { getGenericProps } from '../../lib/utils.js';
import s from './styles.module.css';

type IUsersProps = {
  users: IUser[];
};

export async function getServerSideProps(ctx) {
  const users = await orm.User.query();
  const props = await getGenericProps({ ctx, keygrip, orm }, { users });
  return { props };
}

const userIconClass = role => cn('mr-1', userRolesToIcons[role]);

const Users = ({ users }: IUsersProps) => {
  const { useStore, axios } = useContext();
  const signedInUsersIds = useStore(state => state.signedInUsersIds);
  const { isAdmin } = useStore(session);
  const refreshPage = useRefreshPage();

  const deleteUser = id =>
    dedup(async () => {
      await axios.delete(getApiUrl('user', { id }));
      refreshPage();
    });
  const onlineIconClass = userId =>
    cn('online-icon mx-auto', {
      ['online-icon_online']: signedInUsersIds.includes(userId),
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
          {users?.map(user => (
            <tr key={user.id}>
              <td className={s.isOnlineCell}>
                <i className={onlineIconClass(user.id)}></i>
              </td>
              <td>{user.name}</td>
              <td>
                <div className="flex items-center">
                  <i className={userIconClass(user.role)}></i>
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
                    <div className="btn-outline btn-outline_sm" onClick={deleteUser(user.id)}>
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
