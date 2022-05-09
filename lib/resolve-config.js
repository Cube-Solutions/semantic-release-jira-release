module.exports = (
  {jiraHost, jiraUsername, jiraPassword, jiraProjects, releaseNameTemplate, releaseDescriptionTemplate},
  {
    env: {
      JIRA_HOST,
      JIRA_USERNAME,
      JIRA_PASSWORD,
    },
  }
) => {
  return {
    jiraHost: jiraHost || JIRA_HOST,
    jiraUsername: jiraUsername || JIRA_USERNAME,
    jiraPassword: jiraPassword || JIRA_PASSWORD,
    jiraProjects: jiraProjects,
    releaseNameTemplate: releaseNameTemplate,
    releaseDescriptionTemplate: releaseDescriptionTemplate,
  };
};