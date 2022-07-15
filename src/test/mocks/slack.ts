jest.mock('@slack/bolt', () => {
  const mSlack = {
    client: {
      users: {
        info: jest.fn().mockImplementation(() => {
          return {
            user: {
              profile: {
                real_name_normalized: 'I like rice',
              },
            },
          };
        }),
      },
    },
  };
  return { App: jest.fn().mockImplementation(() => mSlack) };
});
