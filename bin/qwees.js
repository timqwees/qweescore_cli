#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const decompress = require('decompress');
const { exec } = require('child_process');

//VERSION ======
version = 'v1.1.0';
// ==============

// Minimal color utility
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  purple: '\x1b[35m',
  blue: '\x1b[34m',
  dark: '\x1b[90m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgDark: '\x1b[100m'
};
function color(text, color) {
  return COLORS[color] ? COLORS[color] + text + COLORS.reset : text;
}

function info(text) {
  return `${color('[INFO]', 'cyan')} ${text}`;
}
function errorMsg(text) {
  return `${color('[CRASH]', 'red')} ${color(text, 'red')}`;
}
function ok(text) {
  return `${color('[SUCCESS]', 'green')} ${text}`;
}

// Simple logo (short, less text)
function showLogo() {
  console.log(color('\nQweesCore', 'cyan') + color(' PHP ', 'gray') + color('CLI', 'cyan'));
}

// Progress bar animation
let barInterval = null;
function startBar(text) {
  let width = 54;
  let pos = 0;
  process.stdout.write('\n');
  barInterval = setInterval(() => {
    let bar = '='.repeat(pos) + '>' + ' '.repeat(width - pos - 1);
    process.stdout.write(
      '\r' + color(`[${bar}]`, 'yellow') + ' ' + text
    );
    pos = (pos + 1) % width;
  }, 60);
}
function stopBar(finalText, success = true) {
  clearInterval(barInterval);
  process.stdout.write(
    '\r' + (success ? ok(finalText) : errorMsg(finalText)) + '\n'
  );
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0], projectName = args[1];

  if (cmd !== 'install' || !projectName) {
    showLogo();
    console.log(errorMsg('Please, usage command: ') + color(' npx qwees install ' + color(' <project name> ', 'bgMagenta'), 'bgWhite'));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(errorMsg(`Folder already exists: `) + color(' test ', 'bgRed'));
    process.exit(1);
  }

  showLogo();
  console.log(info(`Making: ${color(projectName, 'yellow')}`));

  try {
    // 1. Create folder
    startBar('Create folder');
    await fs.ensureDir(targetDir);
    stopBar('Folder ready');

    // 2. Download archive
    const zipUrl = `https://github.com/timqwees/QweesCore/archive/refs/tags/${version}.zip`;
    const zipPath = path.join(targetDir, 'qwees.zip');

    startBar('⌛️ Downloading...');
    const response = await axios({ url: zipUrl, method: 'GET', responseType: 'arraybuffer' });
    await fs.writeFile(zipPath, response.data);
    stopBar('✅ Downloaded!');

    // 3. Extract
    startBar('📦 Extracting...');
    await decompress(zipPath, targetDir);
    await fs.remove(zipPath);
    stopBar('✅ Extracted!');

    // 4. Move files up if needed
    const dirs = [path.join(targetDir, 'qwees-main'), path.join(targetDir, `QweesCore-${version} `)];
    let moveSrc = dirs.find(dir => fs.existsSync(dir));
    if (moveSrc) {
      startBar('🔄 Moving files...');
      for (const file of await fs.readdir(moveSrc)) {
        await fs.move(
          path.join(moveSrc, file),
          path.join(targetDir, file),
          { overwrite: true }
        );
      }
      await fs.remove(moveSrc);
      stopBar('✅ Ready!');
    }

    startBar('🚀 Installing Composer dependencies...');
    exec(
      `cd "${projectName}" && composer install || composer update && composer require vlucas/phpdotenv phpmailer/phpmailer || true`,
      (error, stdout, stderr) => {
        stopBar('✅ Command successed!');
        if (error) {
          console.error(errorMsg(`${error.message}`));
        }
        if (stdout) {
          console.log(ok(`${stdout}`));
        }
        if (stderr) {
          console.error(info(`${stderr}`));
        }

        let art = [
          "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
          color(`

  ████████ █████ ███ █████  ██████   ██████   █████   ██████   ██████  ████████   ██████
 ███░░███ ░░███ ░███░░███  ███░░███ ███░░███ ███░░   ███░░███ ███░░███░░███░░███ ███░░███
░███ ░███  ░███ ░███ ░███ ░███████ ░███████ ░░█████ ░███ ░░░ ░███ ░███ ░███ ░░░ ░███████
░███ ░███  ░░███████████  ░███░░░  ░███░░░   ░░░░███░███  ███░███ ░███ ░███     ░███░░░
░░███████   ░░████░████   ░░██████ ░░██████  ██████ ░░██████ ░░██████  █████    ░░██████
 ░░░░░███    ░░░░ ░░░░     ░░░░░░   ░░░░░░  ░░░░░░   ░░░░░░   ░░░░░░  ░░░░░      ░░░░░░
     ░███
     █████
    ░░░░░
      `, 'green'),
          '🎉 ' + color('Project successfully installed!', 'green'),
          '✨ ' + color('Welcome to QweesCore!', 'white'),
          "",
          color('❇️ Your next steps:', 'white'),
          color('   [START COMMAND]', 'bgDark') + ' ' + color(' php -S localhost:8000 -t public ', 'bgWhite'),
          "",
          color('[INFO] Documentation:', 'gray') + color(' https://github.com/timqwees/qweescore', 'blue') + "\n"
        ];
        for (const line of art) console.log(line);
      }
    );
  } catch (err) {
    if (barInterval) clearInterval(barInterval);
    console.error(errorMsg('Error: ' + err.message));
    process.exit(1);
  }
}

main();
