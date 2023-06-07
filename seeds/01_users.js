const crypto = require('crypto');
const { omit } = require('lodash');

const users = [
  {
    id: -1,
    name: 'Vasa',
    role: 'admin',
    email: 'vasa@yandex.ru',
    password: '1',
    avatar_id: -2,
  },
  {
    id: -2,
    name: 'Tom',
    role: 'user',
    email: 'tom@thunderstorm.com',
    password: '1',
    avatar_id: -5,
  },
  {
    id: -3,
    name: 'Fedya',
    role: 'user',
    email: 'fedya@yandex.ru',
    password: '1',
    avatar_id: -3,
  },
  {
    id: -4,
    name: 'ImbaQ',
    role: 'user',
    email: 'ImbaQ@yandex.ru',
    password: '1',
    avatar_id: -4,
  },
  {
    id: -5,
    name: 'Ryan Florence',
    role: 'user',
    email: 'ryanF@gmail.com',
    password: '1',
    avatar_id: -7,
  },
  {
    id: -6,
    name: 'Iron Man',
    role: 'user',
    email: 'i.manD@mail.ru',
    password: '1',
    avatar_id: -6,
  },
  {
    id: -7,
    name: 'Sarah Dayan',
    role: 'user',
    email: 'sarahD@gmail.com',
    password: '1',
    avatar_id: -9,
  },
];

const encrypt = value => crypto.createHash('sha256').update(value).digest('hex');

module.exports.seed = async knex => {
  const newUsers = users
    .map(user => ({ ...user, password_digest: encrypt(user.password) }))
    .map(user => omit(user, 'password'));
  await knex('users').delete();
  await knex('users').insert(newUsers);
};
