const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const commandMapping = {
  exit: () => {
    process.exit(0);
  },
  echo: (_, args) => {
    console.log(args.join(" "));
  },
  type: (_, args) => {
    const command = args[0];
    if (commandMapping[command]) {
      console.log(`${command} is a shell builtin`);
    } else {
      console.log(`${command}: not found`);
    }
  },
};
function prompt() {
  rl.question("$ ", (answer) => {
    const [command, ...args] = answer.split(" ");
    if (commandMapping[command]) {
      commandMapping[command](command, args);
    } else {
      console.log(`${command}: command not found`);
    }
    prompt();
  });
}
prompt();
