/* eslint-disable @typescript-eslint/no-explicit-any */

// export const environment = {
//  production: false,
//   development: true,
//     apiURL: "https://localhost:7159/api",
//     apiHub: "https://localhost:7159/parkingHub",



//   //    production: true,
//   // apiBase: '/api'
// };
export const environment = {
  production: false,
  development: true,

  apiURL: (window as any)['env']?.API_URL || 'http://localhost:5100/api',
  apiHub: (window as any)['env']?.API_HUB || 'http://localhost:5100/parkingHub'
};

