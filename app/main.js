import { delimiter, join } from "path";
import { createInterface } from "readline";
import { existsSync } from "fs";
import { execFileSync } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function isExecutableFound(command) {
  return process.env.PATH.split(delimiter).reduce(
    (result, dir) => {
      if (result.found) return result;
      const fullPath = join(
        dir,
        command + (process.platform === "win32" ? ".exe" : "")
      );
      return existsSync(fullPath) ? { found: true, path: fullPath } : result;
    },
    { found: false, path: "" }
  );
}

const commandMapping = {
  exit: () => process.exit(0),
  echo: (_, args) => console.log(args.join(" ")), // Ensure args are joined correctly
  type: (_, [command]) => {
    if (commandMapping[command]) {
      console.log(`${command} is a shell builtin`);
    } else {
      const { found, path } = isExecutableFound(command);
      console.log(found ? `${command} is ${path}` : `${command}: not found`);
    }
  },
  pwd: () => console.log(process.cwd()),
  cd: (_, args) => {
    const targetPath =
      args.join(" ") === "~" ? process.env.HOME : args.join(" ");
    try {
      process.chdir(targetPath);
    } catch (err) {
      console.error(`cd: ${targetPath}: No such file or directory`);
    }
  },
};

function executeCommand(command, args) {
  if (commandMapping[command]) {
    commandMapping[command](command, args);
  } else {
    const { found, path } = isExecutableFound(command);
    const cmd = path.split("/").at(-1);
    if (found) {
      execFileSync(cmd, args, { encoding: "utf-8", stdio: "inherit" });
    } else {
      console.log(`${command}: command not found`);
    }
  }
}

/**
 * Parses input correctly handling:
 * - Single and double quotes
 * - Cases where quotes are directly next to each other ('test''shell' → 'testshell')
 * - Spaces inside quotes
 */
function inputParsing(input) {
  if (typeof input !== "string")
    throw new TypeError(`Expected type String, found ${typeof input}`);

  let args = [];
  let current = "";
  let quote = null; // Tracks whether inside single or double quotes

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "'" || char === '"') {
      if (quote === char) {
        // Closing quote
        quote = null;
      } else if (!quote) {
        // Opening quote
        quote = char;
      } else {
        // Inside quotes, treat as normal character
        current += char;
      }
    } else if (char === " " && !quote) {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) args.push(current);

  const command = args.shift() || "";
  return { command, args };
}

function prompt() {
  rl.question("$ ", (input) => {
    try {
      const { command, args } = inputParsing(input);
      executeCommand(command, args);
      if (command !== "exit") prompt();
    } catch (error) {
      console.error(error.message);
    }
  });
}

prompt();
