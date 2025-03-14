const path = require("path");
const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function isExecutableFound(command) {
  const directories = process.env.PATH.split(path.delimiter);
  for (const dir of directories) {
    const fullPath = path.join(
      dir,
      command + (process.platform === "win32" ? ".exe" : "")
    );
    if (fs.existsSync(fullPath)) {
      return {
        found: true,
        path: fullPath,
      };
    }
  }
  return {
    found: false,
    path: "",
  };
}
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
      const result = isExecutableFound(command);
      if (result.found) console.log(`${command} is ${result.path}`);
      else console.log(`${command}: not found`);
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
