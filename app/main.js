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
};
function prompt() {
  rl.question("$ ", (answer) => {
    const [command, ...args] = answer.split(" ");
    if (Object.hasOwn(commandMapping, command)) {
      commandMapping[command](command, args);
    } else {
      console.log(`${command}: command not found`);
    }
    prompt();
  });
}
prompt();
