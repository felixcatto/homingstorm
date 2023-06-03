import originalAxios from 'axios';
import { getUrl } from '../lib/utils.js';

describe('requests', () => {
  const baseURL = process.env.HTTP_SERVER_URL;
  const axios = originalAxios.create({ baseURL });

  it('GET 200', async () => {
    const res = await axios.get(getUrl('home'));
    expect(res.status).toBe(200);
  });
});
