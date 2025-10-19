export const environment = {
  production: true,
  api: {
    Account: {
      Login: {
        method: 'POST',
        url: 'api/Account/Login'
      },
      Logout: {
        method: 'POST',
        url: 'api/Account/Logout'
      },
      ExchangeAuthCode: {
        method: 'POST',
        url: 'api/Account/ExchangeAuthCode'
      },
      Profile: {
        method: 'GET',
        url: 'api/Account/Profile'
      },
      RefreshToken: {
        method: 'POST',
        url: 'api/Account/RefreshToken'
      },
    },
  }
};
