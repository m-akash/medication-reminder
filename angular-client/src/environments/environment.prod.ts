export const environment = {
  production: true,
  // Empty string = same origin. Single-domain deploy: Angular and backend
  // are served together, so relative requests (/api/..., /connect/...) go to
  // the same host.
  apiUrl: ''
};
