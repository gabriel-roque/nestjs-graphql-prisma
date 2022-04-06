import * as faker from 'faker';

const sigup = (data?: { name: string; email: string; password: string }) => `
  mutation {
    signup(
      data: {
        name: "${data?.name ? data.name : faker.name.firstName()}"
        email: "${data?.email ? data.email : faker.internet.email()}"
        password: "${
          data?.password ? data.password : faker.internet.password()
        }"
      }
    ) {
      accessToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const mutations = {
  sigup: sigup,
};
