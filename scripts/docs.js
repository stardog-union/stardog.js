/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */

const typedocs = require('typedocs');
const fs = require('fs');
const path = require('path');


const pathToDeclaration = path.resolve(`${__dirname}/../lib/index.d.ts`);
const pathToREADME = path.resolve(`${__dirname}/../README.md`);
console.log(pathToDeclaration);
console.log(pathToREADME)
function getMarkdown(obj) {
  const kind = obj.kind;
  /* FunctionDeclaration */
  if (kind === 216) {
    return ''.concat(
      `### ${obj.name}\n\n`,
      `${obj.documentation}\n\n`,
      `Expects the following parameters:\n${obj.parameters.reduce(
        (acc, val) => acc.concat(`- ${val.name} (\`${val.type}\`)\n`),
        ''
      )}`,
      '\n'
    );
  }
  /* ClassDeclaration */
  if (kind === 217) {
    let md = `## Class ${obj.name}\n\n`;
    const constructor = obj.members.shift().parameters[0];
    md += `Constructed with:\n- ${constructor.name} (\`${constructor.type}\`)\n`;
    if (obj.members) {
      obj.members.forEach(child => {
        md = md.concat(getMarkdown(child));
      });
    }
    return md;
  }
  /* InterfaceDeclaration */
  if (kind === 218) {
    return ''.concat(
      `### ${obj.name}\n\n`,
      `Object with the following values:\n${obj.members.reduce(
        (acc, val) => acc.concat(`- ${val.name} (\`${val.type}\`)\n`),
        ''
      )}`,
      '\n'
    );
  }
  /* PropertySignature */
  if (kind === 141) {
    return '';
  }
  /* MethodSignature */
  if (kind === 143) {
    let md = `### ${obj.name ? obj.name : ''}\n\n`;
    md += `Method takes the following params:\n${obj.parameters.reduce(
      (acc, val) => acc.concat(`- ${val.name} (\`${val.type}\`)\n`),
      ''
    )}\n`;
    return md;
  }
  /* ModuleDeclaration */
  if (kind === 221) {
    let md = `## ${obj.name}\n\n`;
    if (obj.members) {
      obj.members.forEach(child => {
        md = md.concat(getMarkdown(child));
      });
    }
    return md;
  }
  /* Parameter */
  // if (kind === 139) {
  //   return 'Parameterrrr';
  // }
  return '';
}

Promise.resolve(typedocs.generate([pathToDeclaration]))
  // .then(res => console.log(res))
  .then(res =>
    res
      .filter(value => value.name && value.name === `"${pathToDeclaration}"`)[0]
      .members.filter(x => x.kind === 217 || x.kind === 221)
  )
  .then(res => {
    let markdown = '';
    res.forEach(obj => {
      markdown = markdown.concat(getMarkdown(obj));
    });
    return markdown;
  })
  .then(markdown => {
    fs.readFile(pathToREADME, 'utf8', (err, data) => {
      data = data.split('## API');
      data = data[0].concat('## API\n\n', markdown);
      fs.writeFile(pathToREADME, data, error => error);
    });
  })
  .catch(console.err);
