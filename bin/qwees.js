#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const decompress = require('decompress');

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const projectName = args[1];

  // Проверка аргументов
  if (cmd !== 'install' || !projectName) {
    console.log('✨ [WARNING] Usage: npx qwees install <project-name>');
    console.log('   Example: qwees install blog');
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Проверка: не существует ли уже папка
  if (fs.existsSync(targetDir)) {
    console.error(`❌ [Error]: Directory: '${projectName}' already exists.`);
    process.exit(1);
  }

  console.log(`🚀 [START] Creating Qwees project: ${projectName}`);

  try {
    // 1. Создаём папку проекта
    await fs.ensureDir(targetDir);

    // 2. Скачиваем ZIP с GitHub (твой репозиторий фреймворка)
    const zipUrl = 'https://github.com/timqwees/QweesCore/archive/refs/heads/main.zip';
    const zipPath = path.join(targetDir, 'qwees.zip');

    const response = await axios({
      url: zipUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    await fs.writeFile(zipPath, response.data);
    console.log('📦 [==>] Downloaded QweesCore by TimQwees...');

    // 3. Распаковка
    await decompress(zipPath, targetDir);
    await fs.remove(zipPath);
    console.log('🔓 Extracted...');

    // 4. Перемещаем содержимое из qwees-main/ в корень проекта
    const extractedDir = path.join(targetDir, 'qwees-main');
    if (fs.existsSync(extractedDir)) {
      const files = await fs.readdir(extractedDir);
      for (const file of files) {
        await fs.move(
          path.join(extractedDir, file),
          path.join(targetDir, file),
          { overwrite: true }
        );
      }
      await fs.remove(extractedDir);
    }

    console.log(`✅ [SUCCESS]! Project '${projectName}' is ready.`);
    console.log(`\n👉 Next steps:`);
    console.log(`   cd ${projectName}`);
    console.log(`   composer install && composer require vlucas/phpdotenv phpmailer/phpmailer`);
    console.log(`   cp .env.example .env`);
    console.log(`   php -S localhost:8000`);
  } catch (err) {
    console.error(`⛔️ [Failed]: ${err.message}`);
    process.exit(1);
  }
}

main();
