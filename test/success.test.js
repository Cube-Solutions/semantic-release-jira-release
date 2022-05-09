const test = require('ava')
const success = require('../lib/success')
const nock = require('nock');
const {stub} = require('sinon');

const jiraHost = process.env.JIRA_HOST
const jiraUsername = process.env.JIRA_USERNAME
const jiraPassword = process.env.JIRA_PASSWORD
const jiraProject = 'ML'
const jiraProjects = [jiraProject]

test.beforeEach(t => {
  // Mock logger
  t.context.log = stub();
  t.context.error = stub();
  t.context.logger = {log: t.context.log, error: t.context.error};
});

test.afterEach.always(() => {
  // Clear nock
  nock.cleanAll();
});

test.serial('Creates JIRA release', async t => {
  const env = {
    JIRA_HOST: jiraHost,
    JIRA_USERNAME: jiraUsername,
    JIRA_PASSWORD: jiraPassword,
  };
  const nextRelease = {version: '1.0.1'};
  const commits = [
    {short:  "123456", message: "fix: ML-1581 This is a test"},
    {short:  "789876", message: "fix: ML-1582 This is also a test"},
  ]

  await t.notThrowsAsync(
    success({
      jiraProjects: jiraProjects,
      releaseNameTemplate: 'Unit ${version}',
      releaseDescriptionTemplate: 'Full release notes are available at: ${releaseUrl}',
      releaseUrlTemplate: 'https://github.com/test/test/releases/${version}',
    }, {env, commits, nextRelease, logger: t.context.logger})
  );
});
