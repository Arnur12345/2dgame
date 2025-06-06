const fs = require('fs');
const path = require('path');

console.log('🔥 Начинаю переключение на Firebase...\n');

const files = [
  {
    path: 'src/App.tsx',
    replacements: [
      {
        from: /import { generateRandomColor, type Player, demoService } from '\.\/services\/localMultiplayer';/g,
        to: "import { generateRandomColor, type Player } from './services/firebase';"
      }
    ]
  },
  {
    path: 'src/hooks/useRealtimePlayers.ts',
    replacements: [
      {
        from: /import { type Player, playerService } from '\.\.\/services\/localMultiplayer';/g,
        to: "import { type Player, playerService } from '../services/firebase';"
      }
    ]
  },
  {
    path: 'src/hooks/usePlayerMovement.ts',
    replacements: [
      {
        from: /import { playerService } from '\.\.\/services\/localMultiplayer';/g,
        to: "import { playerService } from '../services/firebase';"
      }
    ]
  },
  {
    path: 'src/components/GameField.tsx',
    replacements: [
      {
        from: /import { type Player } from '\.\.\/services\/localMultiplayer';/g,
        to: "import { type Player } from '../services/firebase';"
      }
    ]
  },
  {
    path: 'src/components/PlayerList.tsx',
    replacements: [
      {
        from: /import { type Player, demoService } from '\.\.\/services\/localMultiplayer';/g,
        to: "import { type Player } from '../services/firebase';"
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

// Дополнительная проверка и удаление демо-кнопок из PlayerList
try {
  const playerListPath = 'src/components/PlayerList.tsx';
  if (fs.existsSync(playerListPath)) {
    let content = fs.readFileSync(playerListPath, 'utf8');
    
    // Удаляем импорт demoService если он остался
    content = content.replace(/, demoService/g, '');
    
    // Проверяем, есть ли секция с демо-кнопками
    if (content.includes('demo-controls')) {
      console.log(`ℹ️  Найдена секция demo-controls в PlayerList.tsx`);
      console.log(`⚠️  Рекомендуется вручную удалить секцию с демо-кнопками для продакшен-версии`);
    }
    
    fs.writeFileSync(playerListPath, content);
  }
} catch (error) {
  console.log(`⚠️  Предупреждение при обработке PlayerList.tsx:`, error.message);
}

console.log('\n🎯 Сводка:');
console.log(`📁 Обработано файлов: ${processedFiles}`);
console.log(`🔄 Всего замен: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log('\n🔥 Переключение на Firebase завершено!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Убедитесь, что Firebase конфигурация обновлена в src/services/firebase.ts');
  console.log('2. Проверьте, что Realtime Database настроена в Firebase Console');
  console.log('3. Запустите приложение: npm run dev');
  console.log('4. Откройте на разных устройствах для тестирования мультиплеера');
} else {
  console.log('\n🤔 Изменений не найдено. Возможно, уже используется Firebase или файлы изменены.');
}

console.log('\n📖 Подробные инструкции: см. FIREBASE_SETUP.md'); 