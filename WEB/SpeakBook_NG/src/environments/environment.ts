export const environment = {
  production: false,
  currentVersion: "0.13.13",
  successAlertTimeout: 1.5,
  apiBaseUrl: '', // 使用相對路徑，配合 proxy.conf.json 自動轉發
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
