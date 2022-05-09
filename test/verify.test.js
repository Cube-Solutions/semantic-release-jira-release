const test = require('ava')
const verify = require('../lib/verify')
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

test.serial('Throws SemanticReleaseError on invalid project', async t => {
  const env = {
    JIRA_HOST: jiraHost,
    JIRA_USERNAME: jiraUsername,
    JIRA_PASSWORD: jiraPassword,
  };


  const [error, ...errors] = await t.throwsAsync(
    verify({
      jiraProjects: ["bla"],
    }, {env, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EJIRAPROJECTAPI');
});


test.serial('Throws SemanticReleaseError on invalid credentials', async t => {
  const env = {
    JIRA_HOST: jiraHost,
    JIRA_USERNAME: 'blabla',
    JIRA_PASSWORD: 'blabla',
  };


  const [error, ...errors] = await t.throwsAsync(
    verify({
      jiraProjects,
    }, {env, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EJIRAPROJECTAPI');
});

test.serial('Verifies project and credentials', async t => {
  const env = {
    JIRA_HOST: jiraHost,
    JIRA_USERNAME: jiraUsername,
    JIRA_PASSWORD: jiraPassword,
  };


  await t.notThrowsAsync(
    verify({
      jiraProjects,
    }, {env, logger: t.context.logger})
  );

  t.deepEqual(t.context.log.args[0], [
    'Verify JIRA authentication for project (%s)',
    jiraProject,
  ]);

});
