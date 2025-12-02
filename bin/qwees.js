#!/usr/bin/env node

// Проверь — базовая логика CLI инсталлятора QweesCore

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const decompress = require('decompress');
const { exec } = require('child_process');

// VERSION — определяет QweesCore версию
// https://github.com/timqwees/QweesCore/releases/
const version = '2.0.0';

// Минимальная цветовая утилита ANSI для форматирования вывода
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

// Логотип QweesCore для CLI
function showLogo() {
  console.log(color('\nQweesCore', 'cyan') + color(' PHP ', 'gray') + color('CLI', 'cyan'));
}

// Прогресс-бар для вывода "ожидания"
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
  if (barInterval) clearInterval(barInterval);
  process.stdout.write(
    '\r' + (success ? ok(finalText) : errorMsg(finalText)) + '\n'
  );
}

// Основная логика CLI
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0], projectName = args[1];

  if (cmd !== 'install' || !projectName) {
    showLogo();
    console.log(errorMsg('Please, usage command: ') + color(' npx qwees install ' + color(' <project name> ', 'bgMagenta'), 'bgWhite'));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Проверка: если папка существует — ошибка
  if (fs.existsSync(targetDir)) {
    console.error(errorMsg(`Folder already exists: `) + color(` ${projectName} `, 'bgRed'));
    process.exit(1);
  }

  showLogo();
  console.log(info(`Making: ${color(projectName, 'yellow')}`));

  try {
    // Шаг 1: создаём директорию для проекта
    startBar('📁 Creating project folder...');
    await fs.ensureDir(targetDir);
    stopBar('✅ Folder created!');

    // Шаг 2: скачиваем архив
    const zipUrl = `https://github.com/timqwees/QweesCore/archive/refs/tags/v${version}.zip`;
    const zipPath = path.join(targetDir, 'qwees.zip');

    startBar('⌛️ Downloading...');
    const response = await axios({ url: zipUrl, method: 'GET', responseType: 'arraybuffer' });
    await fs.writeFile(zipPath, response.data);
    stopBar('✅ Downloaded!');

    // Шаг 3: распаковываем
    startBar('📦 Extracting...');
    await decompress(zipPath, targetDir);
    await fs.remove(zipPath);
    stopBar('✅ Extracted!');

    // Шаг 4: находим и перемещаем файлы из подпапки в корень проекта
    startBar('🔄 Moving files...');

    let moveSrc = null;

    // Ищем папку QweesCore-{version}
    const expectedDir = path.join(targetDir, `QweesCore-${version}`);
    if (fs.existsSync(expectedDir)) {
      moveSrc = expectedDir;
    } else {
      // Если не нашли, ищем любую папку, начинающуюся с QweesCore
      try {
        const allDirs = await fs.readdir(targetDir);
        for (const dir of allDirs) {
          const fullPath = path.join(targetDir, dir);
          if (fs.statSync(fullPath).isDirectory() && dir.startsWith('QweesCore-')) {
            moveSrc = fullPath;
            break;
          }
        }
      } catch (err) {
        console.error(errorMsg(`Error finding subdirectory: ${err.message}`));
      }
    }

    // Перемещаем все файлы из подпапки в корень проекта
    if (moveSrc && fs.existsSync(moveSrc)) {
      try {
        const files = await fs.readdir(moveSrc);
        for (const file of files) {
          const srcPath = path.join(moveSrc, file);
          const destPath = path.join(targetDir, file);
          if (srcPath !== destPath) {
            await fs.move(srcPath, destPath, { overwrite: true });
          }
        }
        // Удаляем пустую папку
        await fs.remove(moveSrc);
        stopBar('✅ Files moved!');
      } catch (err) {
        stopBar('⚠️ Error moving files: ' + err.message);
        console.error(errorMsg(`Failed to move files: ${err.message}`));
      }
    } else {
      stopBar('⚠️ No subdirectory found');
    }

    // Определяем package.json и composer.json
    const packageJson = {
      "name": "qweescore",
      "version": `${version}`,
      "description": "Qwees_CorePro is a modern PHP framework: easy to learn, fully webroot-independent, rich in features, with constant updates. Enables building any application and solving problems of any complexity. Ideal for engineers, SEO professionals, and everyone who values simplicity and power. | Qwees_CorePro — современный PHP-фреймворк: простой в изучении, независимый от webroot, с богатым набором функций и постоянными обновлениями. Позволяет создавать любые приложения и решать задачи любого уровня сложности. Идеален для инженеров, SEO-специалистов и всех, кто ценит простоту и мощь инструмента.",
      "keywords": [
        "qweescore",
        "qwees",
        "php",
        "framework"
      ],
      "homepage": "https://github.com/timqwees/QweesCore#readme",
      "bugs": {
        "url": "https://github.com/timqwees/QweesCore/issues"
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/timqwees/QweesCore.git"
      },
      "license": "MIT",
      "author": "timqwees",
      "type": "commonjs",
      "main": "index.php",
      "bin": {
        "qwees": "./app/Config/CLI/qwees",
        "run": "./app/Config/CLI/run"
      },
      "scripts": {
        "qwees:start": "php -S localhost:8000"
      },
      "dependencies": {
        "php": "^8.0.0"
      }
    };

    const composerJson = {
      "name": "timqwees/qweescore",
      "description": "Qwees_CorePro: Максимально простой для изучения, полностью вынесенное за пределы webroot ядро проекта. Многофункциональный PHP-фреймворк, который постоянно развивается и расширяется. Позволяет создавать любые приложения и решать любые задачи независимо от направления, специальности или уровня — от инженера до SEO-специалиста. С Qwees_CorePro возможно всё. | Qwees_CorePro: The easiest-to-learn, fully webroot-independent core for your project. A multifunctional PHP framework that is constantly updated with new features. Enables you to build any kind of application and solve any problems regardless of your field, specialty, or experience level — perfect for engineers and SEO specialists alike. With Qwees_CorePro, everything is possible.",
      "type": "project",
      "version": `${version}`,
      "license": "GPL-3.0-or-later",
      "require": {
        "php": ">=7.4",
        "ext-pdo": "*",
        "ext-json": "*",
        "phpmailer/phpmailer": "^6.10",
        "vlucas/phpdotenv": "^5.6"
      },
      "autoload": {
        "psr-4": {
          "App\\": "app/",
          "Setting\\": "setting/"
        }
      },
      "scripts": {}
    };

    // Создаём package.json и composer.json в корне проекта
    try {
      await fs.writeJson(
        path.join(targetDir, 'package.json'),
        packageJson,
        { spaces: 2 }
      );
      await fs.writeJson(
        path.join(targetDir, 'composer.json'),
        composerJson,
        { spaces: 2 }
      );
    } catch (writeError) {
      console.error(errorMsg(`Failed to create package.json/composer.json: ${writeError.message}`));
    }

    // Устанавливаем зависимости через Composer
    startBar('🚀 Installing Composer dependencies...');
    exec(
      `cd "${projectName}" && (composer install || composer update) && composer require vlucas/phpdotenv phpmailer/phpmailer || true && chmod +x ./app/Config/CLI/qwees && chmod +x ./app/Config/CLI/run && npm link`,
      async (error, stdout, stderr) => {
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
        // ASCII-арт и инструкции
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
          color('   [START COMMAND]', 'bgDark') + ' ' + color(' qwees start|run ', 'bgWhite'),
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
