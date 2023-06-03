import { defineConfig } from 'cypress';
import { loadEnv, makeKnex } from './lib/devUtils.js';
import { IKnexSeedArg } from './lib/types.js';

loadEnv();

const knex = makeKnex();

export default defineConfig({
  e2e: {
    baseUrl: process.env.HTTP_SERVER_URL,
    setupNodeEvents(on) {
      on('task', {
        seed: async (arg: IKnexSeedArg) => {
          const [tableName, fixture] = arg;
          await knex(tableName).delete();
          await knex(tableName).insert(fixture);
          return null;
        },
      });
    },
  },
  video: false,
});
