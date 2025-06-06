const fs = require('fs');
const path = require('path');

console.log('🏠 Начинаю переключение на локальный режим...\n');

const files = [
  {
    path: 'src/App.tsx',
    replacements: [
      {
        from: /import { generateRandomColor, type Player } from '\.\/services\/firebase';/g,
        to: "import { generateRandomColor, type Player, demoService } from './services/localMultiplayer';"
      }
    ]
  },
  {
    path: 'src/hooks/useRealtimePlayers.ts',
    replacements: [
      {
        from: /import { type Player, playerService } from '\.\.\/services\/firebase';/g,
        to: "import { type Player, playerService } from '../services/localMultiplayer';"
      }
    ]
  },
  {
    path: 'src/hooks/usePlayerMovement.ts',
    replacements: [
      {
        from: /import { playerService } from '\.\.\/services\/firebase';/g,
        to: "import { playerService } from '../services/localMultiplayer';"
      }
    ]
  },
  {
    path: 'src/components/GameField.tsx',
    replacements: [
      {
        from: /import { type Player } from '\.\.\/services\/firebase';/g,
        to: "import { type Player } from '../services/localMultiplayer';"
      }
    ]
  },
  {
    path: 'src/components/PlayerList.tsx',
    replacements: [
      {
        from: /import { type Player } from '\.\.\/services\/firebase';/g,
        to: "import { type Player, demoService } from '../services/localMultiplayer';"
      }
    ]
  }
];

let totalReplacements = 0;
let processedFiles = 0;

files.forEach(fileConfig => {
  try {
    if (!fs.existsSync(fileConfig.path)) {
      console.log(`⚠️  Файл не найден: ${fileConfig.path}`);
      return;
    }

    let content = fs.readFileSync(fileConfig.path, 'utf8');
    let fileReplacements = 0;

    fileConfig.replacements.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches) {
        content = content.replace(replacement.from, replacement.to);
        fileReplacements += matches.length;
      }
    });

    if (fileReplacements > 0) {
      fs.writeFileSync(fileConfig.path, content);
      console.log(`✅ ${fileConfig.path} - заменено импортов: ${fileReplacements}`);
      totalReplacements += fileReplacements;
    } else {
      console.log(`ℹ️  ${fileConfig.path} - изменений не требуется`);
    }
    
    processedFiles++;
  } catch (error) {
    console.log(`❌ Ошибка при обработке ${fileConfig.path}:`, error.message);
  }
});

console.log('\n🎯 Сводка:');
console.log(`📁 Обработано файлов: ${processedFiles}`);
console.log(`🔄 Всего замен: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log('\n🏠 Переключение на локальный режим завершено!');
  console.log('\n📋 Возможности локального режима:');
  console.log('✅ Работает без настройки Firebase');
  console.log('✅ Синхронизация между вкладками браузера');
  console.log('✅ Демо-боты для тестирования');
  console.log('✅ Локальное хранилище данных');
  console.log('\n🚀 Запустите приложение: npm run dev');
  console.log('🔄 Откройте несколько вкладок для тестирования мультиплеера');
} else {
  console.log('\n🤔 Изменений не найдено. Возможно, уже используется локальный режим.');
}

console.log('\n📖 Для переключения на Firebase: node switch-to-firebase.js'); 