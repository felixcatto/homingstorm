import makeKeygrip from 'keygrip';
import knexConnect from 'knex';
import { Model } from 'objection';
import knexConfig from '../knexfile.js';
import * as models from '../models/index.js';

const mode = process.env.INODE_ENV || process.env.NODE_ENV;
export const keys = process.env.KEYS!.split(',');

export const keygrip = makeKeygrip(keys);

const knex = knexConnect(knexConfig[mode]);
Model.knex(knex);
export const orm = { ...models, knex };
