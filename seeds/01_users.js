import crypto from 'crypto';
import { omit } from 'lodash-es';
import users from '../__tests__/fixtures/users.js';

const encrypt = value => crypto.createHash('sha256').update(value).digest('hex');

export const seed = async knex => {
  const newUsers = users
    .map(user => ({ ...user, password_digest: encrypt(user.password) }))
    .map(user => omit(user, 'password'));
  await knex('users').delete();
  await knex('users').insert(newUsers);
};
