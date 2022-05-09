const _ = require('lodash')
const resolveConfig = require('./resolve-config')
const createJiraClient = require('./jira')
const ApiError = require('./api-error')
const debug = require('debug')('semantic-release:jira-release');

const escapeRegExp = function (strIn) {
  return strIn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getTickets = function (commits, jiraProjects, logger) {
  let patterns = jiraProjects.map(project => new RegExp(`(${escapeRegExp(project)})-(\\d+)`, 'giu'));

  const foundTickets = new Set()
  for (const commit of commits) {
    for (const pattern of patterns) {
      const matches = commit.message.matchAll(pattern);
      for (const match of matches) {
        foundTickets.add({
          ticket: match[0],
          project: match[1],
        });

        logger.log(`Found ticket ${match[0]} in commit: ${commit.short}`);
      }
    }
  }

  return {tickets: [...foundTickets]};
}


const findOrCreateJiraVersion = async function (jira, projectKey, name, description, logger) {
  try {
    const remoteVersions = await jira.getVersions(projectKey);

    const existing = _.find(remoteVersions, (predicate) => predicate.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      logger.log(`Found existing release '${existing.id}'`);
      return existing
    }

    const project = await jira.getProject(projectKey)

    debug('Creating new release')

    const newVersion = await jira.createVersion({
      name: name,
      description: description || '',
      released: true,
      releaseDate: new Date().toISOString(),
      projectId: project.id
    })

    logger.log(`Created new JIRA version '${newVersion.id}'`)

    return newVersion

  } catch (error) {
    logger.error('An error occurred while creating a new JIRA release:\n%O', error);
    throw error;
  }
}

/**
 *
 * @param {JiraApi} jira
 * @param ticketKey
 * @param jiraVersionId
 * @param logger
 * @returns {Promise<void>}
 */
const linkVersion = async function (jira, ticketKey, jiraVersionId, logger) {

  logger.log(`Updating ticket "${ticketKey}" with version '${jiraVersionId}'`)

  try {
    await jira.updateIssue(ticketKey, {
      update: {
        fixVersions: [{
          add: {id: jiraVersionId},
        }],
      },
    })
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      logger.error(`Ticket "${ticketKey}" not found`)
      return
    }
    logger.error(`Failed updating ticket "${ticketKey}", error\n%O`, e);
    throw e
  }
}

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
    commits,
    nextRelease,
    releases,
  } = context;


  const {tickets} = getTickets(commits, jiraProjects, logger)
  const ticketsPerProject = _.groupBy(tickets, 'project')

  const versionTemplate = _.template(releaseNameTemplate);
  const newVersionName = versionTemplate({version: nextRelease.version});

  const descriptionTemplate = _.template(releaseDescriptionTemplate);
  const newVersionDescription = descriptionTemplate({version: nextRelease.version, url: releases.url});

  const jira = createJiraClient(jiraHost, jiraUsername, jiraPassword)

  for (const projectKey in ticketsPerProject) {
    const projectTickets = ticketsPerProject[projectKey]

    const jiraVersion = await findOrCreateJiraVersion(jira, projectKey, newVersionName, newVersionDescription, logger)

    for (const {ticket} of projectTickets) {
      await linkVersion(jira, ticket, jiraVersion.id, logger)
    }
  }
}