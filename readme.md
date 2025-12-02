# QweesCore CLI

> English | Русский рядом

QweesCore CLI is an installer and project bootstrapper for [QweesCore](https://github.com/timqwees/QweesCore) — a modern PHP framework that is simple to learn, fully webroot-independent, and suited for tasks of any complexity.


QweesCore CLI — установщик и генератор проектов для [QweesCore](https://github.com/timqwees/QweesCore) — современного PHP-фреймворка, который легко изучать, полностью независим от webroot и подходит для задач любой сложности.

---

## Features / Особенности

**Easy Installation**: Create a new QweesCore project with a single command.

**Простая установка**: Создайте новый проект QweesCore одной командой.

- **Zero Config**: No manual setup required. All boilerplate and dependencies ready-to-go.
  **Без настроек**: Не требуется ручной конфигурации. Весь шаблон и зависимости готовы.
- **Modern PHP Stack**: Uses Composer, PSR-4 autoloading, .env support, and more.
  **Современный PHP стек**: Использует Composer, автозагрузку PSR-4, поддержку .env и многое другое.
- **Rich CLI Output**: Helpful progress bars, colored output, and clear error reporting.
  **Красивый CLI вывод**: Прогресс-бары, цветной вывод и понятная обработка ошибок.

---

## Quick Start / Быстрый старт

```sh
npx qwees install <project-name>
# or, if installed globally:       # или если установлен глобально:
qwees install <project-name>
```

Replace `<project-name>` with your desired directory/project name.
Замените `<project-name>` на имя папки/проекта.

---

## Example / Пример

```sh
npx qwees install my-app
cd my-app
qwees start
```

The last command will start the PHP built-in development server.
Последняя команда запустит встроенный PHP-сервер для разработки.

---

## Requirements / Требования

- **Node.js** v16 or higher (for this CLI)
  **Node.js** v16 или выше (для этого CLI)
- **PHP** 7.4 or higher
  **PHP** версии 7.4 или выше
- **Composer** (installs dependencies automatically)
  **Composer** (зависимости ставятся автоматически)

---

## After Installation / После установки

- Project files are placed in `<project-name>`.
  Все файлы проекта появятся в `<project-name>`.
- `composer install` and required dependencies are set up for you.
  `composer install` и необходимые зависимости будут автоматически установлены.
- Ready to serve and develop!
  Можно сразу приступать к запуску и разработке!

---

## Useful Commands / Полезные команды

- Start development server:
  Запуск dev-сервера:
  ```sh
  qwees start
  ```
- More documentation: [QweesCore Documentation](https://github.com/timqwees/QweesCore)
  Больше документации: [Документация QweesCore](https://github.com/timqwees/QweesCore)

---

## Getting Help / Получение помощи

- [QweesCore Issues](https://github.com/timqwees/QweesCore/issues)
- [QweesCore Discussions](https://github.com/timqwees/QweesCore/discussions)

---

Made with ❤️ by [timqwees](https://github.com/timqwees).
Сделано с ❤️ от [timqwees](https://github.com/timqwees).
