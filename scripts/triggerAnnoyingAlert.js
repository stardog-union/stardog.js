const chalk = require('chalk');

console.log('\u0007\n');
console.log(chalk.yellow('**********************************************************************************'));
console.log(chalk.yellow('***                                                                            ***'));
console.log(chalk.yellow('*** YOU ARE ABOUT TO RELEASE!!! DID YOU REMEMBER TO RUN `npm version` FIRST??? ***'));
console.log(chalk.yellow('***                                                                            ***'));
console.log(chalk.yellow('**********************************************************************************'));
console.log(chalk.red('\n                         IF NOT, ABORT! (Ctrl/Cmd+C)\n'));

let countdown = 6;

const writeCountdown = () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`                         ...\u0007Publishing in ${countdown} seconds!`);
};

const beAnnoying = () => {
  writeCountdown();
  countdown -= 1;
  if (countdown < 0) {
    console.log(chalk.green('\n\n                                  Publishing!\n'));
    return;
  }
  setTimeout(beAnnoying, 1000);
};

beAnnoying();
