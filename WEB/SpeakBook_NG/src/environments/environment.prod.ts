export const environment = {
  production: true,
  apiBaseUrl: '', // 生產環境使用相對路徑，自動適應部署的域名
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
