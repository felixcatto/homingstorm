import { AxiosInstance } from 'axios';
import cookie from 'cookie';
import { getApiUrl, getSessionValue, sessionName } from '../../lib/utils.js';
import usersFixture from './users.js';

const [admin] = usersFixture;

export const getLoginOptions = async (axios: AxiosInstance, user = admin) => {
  const res = await axios.post(getApiUrl('session'), user);
  const sessionValue = getSessionValue(res.headers);

  return {
    headers: {
      Cookie: cookie.serialize(sessionName, sessionValue),
    },
  };
};
