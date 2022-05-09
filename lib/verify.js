const resolveConfig = require('./resolve-config')
const getError = require('./get-error')
const createJiraClient = require('./jira')
const AggregateError = require('aggregate-error');

module.exports = async function (pluginConfig, context) {

  const {
    jiraHost,
    jiraUsername,
    jiraPassword,
    jiraProjects,
    releaseNameTemplate,
    releaseDescriptionTemplate
  } = resolveConfig(pluginConfig, context)
  const {
    logger,
  } = context;

  const jira = createJiraClient(jiraHost, jiraUsername, jiraPassword)
  const errors = []
  let jiraProject
  for (jiraProject of jiraProjects) {

    logger.log('Verify JIRA authentication for project (%s)', jiraProject);

    try {
      await jira.getProject(jiraProject)
    } catch (e) {
      errors.push(getError('EJIRAPROJECTAPI', {jiraProject, error: e}))
    }
  }

  if (releaseNameTemplate && typeof releaseNameTemplate !== 'string') {
    errors.push(getError('ERELEASENAMETEMPLATE'));
  }

  if (releaseDescriptionTemplate && typeof releaseDescriptionTemplate !== 'string') {
    errors.push(getError('ERELEASEDESCRIPTIONTEMPLATE'));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};
