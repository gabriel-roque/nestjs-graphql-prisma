import { graphqlApi } from 'test/factorys/client.factory';
import { mutations } from 'test/graphql/user.graphql';

describe('[USER MODULE]', () => {
  it('should return user created', async () => {
    const response = await graphqlApi
      .post('/graphql', {
        query: mutations.sigup(),
      })
      .then(({ data }) => data.data);

    expect(response).toHaveProperty(['signup', 'accessToken']);
    expect(response).toHaveProperty('signup.user.id');
    expect(response).toHaveProperty('signup.user.name');
    expect(response).toHaveProperty('signup.user.email');
  });
});
