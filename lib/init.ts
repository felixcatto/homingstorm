import makeKeygrip from 'keygrip';
import knexConnect from 'knex';
import { Model } from 'objection';
import knexConfig from '../knexfile';
import * as models from '../models/index';
import { IOrm } from './types';

const initialize = () => {
  const mode = process.env.NODE_ENV;
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);

  const knex = knexConnect(knexConfig[mode]);
  Model.knex(knex);
  const orm = { ...models, knex };

  return { orm, keys, keygrip };
};

let container: any;

if (process.env.NODE_ENV === 'production') {
  container = initialize();
} else {
  if (!global.__container) {
    global.__container = initialize();
  }
  container = global.__container;
}

const { orm, keys, keygrip } = container;

export { orm, keys, keygrip };
