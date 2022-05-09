

module.exports = {
  EJIRAPROJECTAPI: ({jiraProject, error}) => ({
    message: 'Jira project fetching failed.',
    details: `Fetching the JIRA project ${jiraProject} failed with error ${error}`,
  }),
  ERELEASENAMETEMPLATE: ({jiraProject, error}) => ({
    message: '"releaseNameTemplate" must be a string',
  }),
  ERELEASEDESCRIPTIONTEMPLATE: () => ({
    message: '"releaseDescriptionTemplate" must be a string',
  }),
};
