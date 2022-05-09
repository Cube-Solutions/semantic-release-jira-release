const JiraApi = require('jira-client');
const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
const _postmanRequest = _interopRequireDefault(require("postman-request"));
const ApiError = require('./api-error')

/**
 *
 * @param jiraHost
 * @param jiraUsername
 * @param jiraPassword
 * @returns JiraApi
 */
module.exports = function createJiraClient(
  jiraHost,
  jiraUsername,
  jiraPassword,
) {

  return new JiraApi({
    protocol: 'https',
    host: jiraHost,
    username: jiraUsername,
    password: jiraPassword,
    apiVersion: '2',
    strictSSL: true,
    request: (uri, options) => {
      // Added to raise errors on http status errors: 4xx and 5xx errors
      return new Promise((resolve, reject) => {
        (0, _postmanRequest.default)(uri, options, (err, httpResponse) => {
          if (err) {
            reject(err);
          } else if (httpResponse.statusCode >= 400) {
            reject(new ApiError('Invalid status code received: ' + httpResponse.statusCode, httpResponse.statusCode, httpResponse.body, httpResponse.request))
          } else {
            // for compatibility with request-promise
            resolve(httpResponse.body);
          }
        });
      });
    }
  });
};
