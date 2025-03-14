const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const commandMapping = {
  exit: () => {
    process.exit(0);
  },
  _: (command) => {
    console.log(`${command}: command not found`);
    prompt();
  },
};
function prompt() {
  rl.question("$ ", (answer) => {
    const command = answer.split(" ")[0];
    if (Object.hasOwn(commandMapping, command)) {
      commandMapping[command]();
    } else {
      commandMapping._(command);
    }
  });
}
prompt();
