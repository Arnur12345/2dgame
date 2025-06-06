import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Начинаю быстрое развертывание...\n');

// Проверяем, что мы в корректной директории
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json не найден. Запустите скрипт из корня проекта.');
  process.exit(1);
}

try {
  // Шаг 1: Сборка проекта
  console.log('📦 Собираю проект...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Проект собран успешно!\n');

  // Шаг 2: Проверяем папку dist
  if (!fs.existsSync('dist')) {
    throw new Error('Папка dist не найдена после сборки');
  }

  const distFiles = fs.readdirSync('dist');
  console.log('📁 Файлы в папке dist:');
  distFiles.forEach(file => {
    const stats = fs.statSync(path.join('dist', file));
    const size = (stats.size / 1024).toFixed(1);
    console.log(`   ${file} (${size} KB)`);
  });

  console.log('\n🌐 Варианты развертывания:');
  console.log('');
  console.log('1️⃣  NETLIFY (Drag & Drop):');
  console.log('   • Перейдите на https://netlify.com');
  console.log('   • Перетащите папку "dist" на сайт');
  console.log('   • Получите публичную ссылку');
  console.log('');
  console.log('2️⃣  VERCEL (через CLI):');
  console.log('   • npm install -g vercel');
  console.log('   • vercel --prod');
  console.log('');
  console.log('3️⃣  FIREBASE HOSTING:');
  console.log('   • npm install -g firebase-tools');
  console.log('   • firebase init hosting');
  console.log('   • firebase deploy');
  console.log('');
  console.log('4️⃣  GITHUB PAGES:');
  console.log('   • Загрузите папку dist в GitHub');
  console.log('   • Включите GitHub Pages в настройках репозитория');
  console.log('');

  // Создаем файл с инструкциями
  const instructions = `
# 🚀 Ваш проект готов к развертыванию!

## 📁 Папка для загрузки: ./dist

## 🌐 Быстрое развертывание на Netlify:
1. Откройте https://netlify.com
2. Перетащите папку "dist" на главную страницу Netlify
3. Дождитесь загрузки
4. Получите публичную ссылку

## ⚙️ Текущий режим: Локальный
- Мультиплеер работает между вкладками одного браузера
- Для настоящего мультиплеера настройте Firebase (см. FIREBASE_SETUP.md)

## 🔄 Переключение на Firebase:
1. Получите веб-конфигурацию Firebase
2. Запустите: node switch-to-firebase.js
3. Пересоберите: npm run build
4. Разверните заново

Дата сборки: ${new Date().toLocaleString()}
`;

  fs.writeFileSync('DEPLOY_READY.md', instructions);
  console.log('📋 Создан файл DEPLOY_READY.md с инструкциями');

  console.log('\n🎯 ГОТОВО! Проект готов к развертыванию.');
  console.log('📂 Используйте папку "dist" для загрузки на хостинг.');

} catch (error) {
  console.error('\n❌ Ошибка при подготовке к развертыванию:');
  console.error(error.message);
  console.log('\n🔧 Попробуйте:');
  console.log('1. npm install');
  console.log('2. npm run build');
  process.exit(1);
}

console.log('\n🌍 После развертывания люди смогут:');
console.log('• Заходить на вашу публичную ссылку');
console.log('• Вводить свое имя и присоединяться к игре');
console.log('• Играть вместе (в рамках локального режима)');
console.log('\n💡 Для полноценного мультиплеера настройте Firebase!'); 