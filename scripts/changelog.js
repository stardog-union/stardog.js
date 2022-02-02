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
const query = `query closedMilestones($milestoneCursor: String, $issueCursor: String, $prCursor: String) {
  repository(owner: "stardog-union", name: "stardog.js") {
    milestones(first: 50, after:$milestoneCursor, states:[CLOSED]) {
      nodes {
        title
    		url
        issues(first: 50, after: $issueCursor, states: [CLOSED]) {
          nodes {
            number
            title
            url
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
        pullRequests(first: 50, after: $prCursor, states: [MERGED]) {
          nodes {
            number
            title
            url
          }
          pageInfo {
            endCursor
            hasNextPage
          }
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
function getMilestones(
  milestoneCursor = null,
  issueCursor = null,
  prCursor = null
) {
  if (milestoneCursor === null && issueCursor === null && prCursor === null) {
    console.log(chalk.yellow('\nRequesting release data from GitHub...\n'));
  }

  return fetch(GITHUB_GRAPHQL_ENDPOINT, {
    ...baseFetchOptions,
    body: JSON.stringify({
      query,
      variables: { milestoneCursor, issueCursor, prCursor },
    }),
  })
    .then(res => res.json())
    .then(({ data: { repository: { milestones } } }) =>
      Promise.all(
        milestones.nodes.map(milestone => {
          if (!milestoneAndIssuesData[milestone.title]) {
            milestoneAndIssuesData[milestone.title] = {
              url: milestone.url,
              issues: [],
            };
          }

          milestone.issues.nodes.forEach(issue => {
            milestoneAndIssuesData[milestone.title].issues.push({
              number: issue.number,
              title: issue.title,
              url: issue.url,
            });
          });

          milestone.pullRequests.nodes.forEach(issue => {
            milestoneAndIssuesData[milestone.title].issues.push({
              number: issue.number,
              title: issue.title,
              url: issue.url,
            });
          });

          return milestone.issues.pageInfo.hasNextPage ||
            milestone.pullRequests.pageInfo.hasNextPage
            ? getMilestones(
                milestoneCursor,
                milestone.issues.pageInfo.endCursor,
                milestone.pullRequests.pageInfo.endCursor
              )
            : Promise.resolve();
        })
      ).then(() => {
        if (milestones.pageInfo.hasNextPage) {
          return getMilestones(milestones.pageInfo.endCursor);
        }
        return milestoneAndIssuesData;
      })
    );
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

getMilestones()
  .then(generateChangelog)
  .then(writeChangelogMd)
  .then(() => console.log(chalk.green('Changelog generated successfully!\n')))
  .catch(err => {
    console.error(chalk.red('Creating changelog FAILED!\n'));
    console.error(err);
    process.exit(1);
  });
