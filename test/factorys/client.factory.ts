import config from 'src/configs/config';

import axios from 'axios';

export const graphqlApi = axios.create({
  baseURL: `http://localhost:${config().nest.port}`,
});
