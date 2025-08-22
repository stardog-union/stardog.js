const typedocs = require('typedocs/out');
const fs = require('fs');
const path = require('path');

const pathToDeclaration = path.resolve(`${__dirname}/../lib/index.d.ts`);
const pathToREADME = path.resolve(`${__dirname}/../README.md`);

const getType = type => {
  if (!type) {
    return `\`object\``;
  }

  if (
    type.startsWith('string') ||
    type.startsWith('object') ||
    type.startsWith('array') ||
    type.startsWith('boolean')
  ) {
    return `\`${type}\``;
  }
  if (type.startsWith('{')) {
    const customType = type
      .split(': ')
      .pop()
      .split(' ')
      .shift();
    if (
      customType.startsWith('string') ||
      customType.startsWith('object') ||
      customType.startsWith('array') ||
      customType.startsWith('boolean')
    ) {
      return `\`${type}\``;
    }
    const typeHeader = customType.split('.').pop();
    const replaced = type.replace(customType, getType(typeHeader));
    return replaced;
  }
  const name = type.split('.').pop();
  return `[\`${name}\`](#${name.toLowerCase()})`;
};

const getPath = obj => {
  if (
    obj.parent === null ||
    obj.parent === undefined ||
    obj.parent.name === `"${pathToDeclaration}"`
  )
    return obj.name;
  return `${getPath(obj.parent)}.${obj.name}`;
};

const getMarkdown = (obj, parent = null) => {
  const { kind } = obj;
  /* FunctionDeclaration */
  if (kind === 216) {
    const { type } = obj;
    const typeName = type.slice(type.indexOf('<') + 1, type.lastIndexOf('>'));
    const typeHeading = typeName.split('.').pop();
    return ''.concat(
      `#### <a name="${obj.name.toLowerCase()}">\`${getPath(parent)}.${
        obj.name
      }(${obj.parameters.map(param => param.name).join(', ')})\`</a>\n\n`,
      `${obj.documentation}\n\n`,
      `Expects the following parameters:\n\n${obj.parameters.reduce(
        (acc, val) => acc.concat(`- ${val.name} (${getType(val.type)})\n\n`),
        ''
      )}`,
      `Returns [\`${type}\`](#${typeHeading.toLowerCase()})`,
      '\n\n'
    );
  }
  /* ClassDeclaration */
  if (kind === 217) {
    const param = obj.members.shift().parameters[0];
    let md = ''.concat(
      `## <a name="${obj.name.toLowerCase()}">${obj.name}</a> (Class)\n\n`,
      `Constructed with:\n- ${param.name} (${getType(param.type)})\n`
    );
    if (obj.members) {
      obj.members.forEach(child => {
        md = md.concat(getMarkdown(child, obj));
      });
    }
    return md;
  }
  /* InterfaceDeclaration */
  if (kind === 218) {
    return ''.concat(
      `#### <a name="${obj.name.toLowerCase()}">${obj.name}</a>`,
      obj.extends
        ? ` extends [${obj.extends.types[0]}](#${obj.extends.types[0]
            .split('.')
            .pop()
            .toLowerCase()})`
        : '',
      `\n\n`,
      `Object with the following values:\n\n${obj.members.reduce(
        (acc, val) => acc.concat(`- ${val.name} (\`${val.type}\`)\n`),
        ''
      )}`,
      '\n'
    );
  }
  /* TypeDeclaration */
  if (kind === 219) {
    return ''.concat(
      `#### <a name="${obj.name.toLowerCase()}">${obj.name}</a>\n\n`,
      `One of the following values:\n\n\`${obj.type}\``,
      '\n'
    );
  }
  /* PropertySignature */
  if (kind === 141) {
    return '';
  }
  /* MethodSignature */
  if (kind === 143) {
    return ''.concat(
      `### <a name="${obj.name ? obj.name.toLowerCase() : ''}">`,
      obj.name ? `${getPath(parent)}.${obj.name}` : '',
      `(${obj.parameters.map(param => param.name).join(', ')})`,
      `</a>\n\n`,
      obj.parameters.length
        ? `Takes the following params:\n${obj.parameters.reduce(
            (acc, val) => acc.concat(`- ${val.name} (${getType(val.type)})\n`),
            ''
          )}\n`
        : '',
      `Returns ${getType(obj.type)}\n`
    );
  }
  /* ModuleDeclaration */
  if (kind === 221) {
    let md = `## <a name="${obj.name.toLowerCase()}">${obj.name}</a>\n\n`;
    if (obj.members) {
      obj.members.forEach(child => {
        md = md.concat(getMarkdown(child, obj));
      });
    }
    return md;
  }
  return '';
};

Promise.resolve(typedocs.generate([pathToDeclaration]))
  .then(
    res =>
      res.filter(
        value => value.name && value.name === `"${pathToDeclaration}"`
      )[0].members
  )
  .then(res => {
    let markdown = '';
    res.forEach(obj => {
      markdown = markdown.concat(getMarkdown(obj));
    });
    return markdown;
  })
  .then(
    markdown =>
      new Promise((resolve, reject) => {
        fs.readFile(pathToREADME, 'utf8', (err, data) => {
          if (err) return reject(err);
          // eslint-disable-next-line no-param-reassign
          data = data.slice(0, data.indexOf('<!--- API Goes Here --->'));
          // eslint-disable-next-line no-param-reassign
          data = data.concat('<!--- API Goes Here --->\n# API\n\n', markdown);
          return fs.writeFile(pathToREADME, data, error => {
            if (error) {
              return reject(error);
            }
            return resolve('Success');
          });
        });
      })
  )
  .then(console.log)
  .catch(console.err);
