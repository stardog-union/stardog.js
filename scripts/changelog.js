/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { fetch } = require('fetch-ponyfill')();
const semver = require('semver');
const chalk = require('chalk');

const baseFetchOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    Authorization: `bearer ${process.env.MDCHANGELOG_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const LEGACY_MILESTONE_PREFIX = 'stardog.js-';

// Get closed issues and their milestones and labels, with support for paging
// with a cursor.
const query = `query closedIssuesAndMilestones($cursor: String) {
  repository(owner: "stardog-union", name: "stardog.js") {
    issues(first: 50, after: $cursor, states: [CLOSED]) {
      nodes {
        number
        title
        url
        # Note: we're not going to page through labels. If you have more than 20, what are you doing?
        labels(first: 20) {
          nodes {
            name
          }
        }
        milestone {
          closed
          title
          url
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

// Accumulator for the actual data needed to generate a changelog.
const milestoneAndIssuesData = {};

// Recursively fetches issues using GitHub's GraphQL API and the above query,
// stopping when paging has been completed (`pageInfo.hasNextPage` is false).
function getIssues(cursor = null) {
  if (cursor === null) {
    console.log(chalk.yellow('\nRequesting release data from GitHub...\n'));
  }

  return fetch(GITHUB_GRAPHQL_ENDPOINT, {
    ...baseFetchOptions,
    body: JSON.stringify({
      query,
      variables: { cursor },
    }),
  })
    .then(res => res.json())
    .then(({ data }) => {
      const { issues } = data.repository;

      issues.nodes.forEach(node => {
        const { milestone } = node;
        if (milestone && milestone.closed) {
          if (!milestoneAndIssuesData[milestone.title]) {
            milestoneAndIssuesData[milestone.title] = {
              url: milestone.url,
              issues: [],
            };
          }

          milestoneAndIssuesData[milestone.title].issues.push({
            number: node.number,
            title: node.title,
            url: node.url,
          });
        }
      });

      if (issues.pageInfo.hasNextPage) {
        return getIssues(issues.pageInfo.endCursor);
      }

      return data;
    });
}

// Given a milestone name, pulls the data from `milestoneAndIssueData` and
// returns a text (markdown) string equal to the changelog "block" for that
// milestone.
function getMarkdownForMilestone(milestoneName) {
  let milestoneString = '';
  const milestoneDatum = milestoneAndIssuesData[milestoneName];
  milestoneString += `## [**${milestoneName}**](${milestoneDatum.url})\n`;

  const sortedIssues = milestoneAndIssuesData[milestoneName].issues.sort(
    (issueOne, issueTwo) => {
      const issueOneNumber = parseInt(issueOne.number, 10);
      const issueTwoNumber = parseInt(issueTwo.number, 10);
      return issueTwoNumber - issueOneNumber;
    }
  );
  sortedIssues.forEach(issue => {
    milestoneString += `- [**${issue.number}**](${issue.url}) ${issue.title}\n`;
  });

  return milestoneString;
}

function generateChangelog() {
  console.log(chalk.yellow('Generating changelog markdown...\n'));
  const sortedMilestoneNames = Object.keys(milestoneAndIssuesData).sort(
    (milestoneOne, milestoneTwo) => {
      // Normalize some old, legacy milestone names:
      const milestoneOneName = milestoneOne.startsWith(LEGACY_MILESTONE_PREFIX)
        ? milestoneOne.substring(LEGACY_MILESTONE_PREFIX.length)
        : milestoneOne;
      const milestoneTwoName = milestoneTwo.startsWith(LEGACY_MILESTONE_PREFIX)
        ? milestoneTwo.substring(LEGACY_MILESTONE_PREFIX.length)
        : milestoneTwo;

      /* eslint-disable no-else-return */
      if (semver.lt(milestoneOneName, milestoneTwoName)) {
        return 1;
      } else if (semver.lt(milestoneTwoName, milestoneOneName)) {
        return -1;
      } else {
        return 0;
      }
    }
  );

  return sortedMilestoneNames.map(getMarkdownForMilestone).join('\n');
}

function writeChangelogMd(changelogMarkdown) {
  return fs.writeFileSync(
    path.resolve(__dirname, '..', 'CHANGELOG.MD'),
    changelogMarkdown
  );
}

getIssues()
  .then(generateChangelog)
  .then(writeChangelogMd)
  .then(() => console.log(chalk.green('Changelog generated successfully!\n')))
  .catch(err => {
    console.error(chalk.red('Creating changelog FAILED!\n'));
    console.error(err);
    process.exit(1);
  });
