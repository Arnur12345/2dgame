// ДЕМО конфигурация Firebase для быстрого тестирования
// ВНИМАНИЕ: Это общедоступная демо-база! Создайте свою для продакшена!

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, onDisconnect, remove } from 'firebase/database';

// Демо конфигурация Firebase для проекта dgame-5158a
const firebaseConfig = {
  apiKey: "AIzaSyBYourActualApiKeyFromFirebaseConsole", // Получите из Firebase Console
  authDomain: "dgame-5158a.firebaseapp.com",
  databaseURL: "https://dgame-5158a-default-rtdb.firebaseio.com/",
  projectId: "dgame-5158a",
  storageBucket: "dgame-5158a.appspot.com",
  messagingSenderId: "YourMessagingSenderId", // Получите из Firebase Console
  appId: "YourWebAppId" // Получите из Firebase Console
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Типы для игрока
export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  timestamp: number;
}

// Методы для работы с игроками
export const playerService = {
  // Добавить игрока
  addPlayer: async (player: Player) => {
    try {
      const playerRef = ref(database, `players/${player.id}`);
      await set(playerRef, player);
      
      // Автоматическое удаление при отключении
      const disconnectRef = onDisconnect(playerRef);
      await disconnectRef.remove();
      
      console.log(`✅ Игрок ${player.name} добавлен в игру`);
    } catch (error) {
      console.error('❌ Ошибка добавления игрока:', error);
      throw error;
    }
  },

  // Обновить позицию игрока
  updatePlayerPosition: async (playerId: string, x: number, y: number) => {
    try {
      const playerRef = ref(database, `players/${playerId}/x`);
      await set(playerRef, x);
      const playerRefY = ref(database, `players/${playerId}/y`);
      await set(playerRefY, y);
      const timestampRef = ref(database, `players/${playerId}/timestamp`);
      await set(timestampRef, Date.now());
    } catch (error) {
      console.error('❌ Ошибка обновления позиции:', error);
      // Не выбрасываем ошибку для позиций, чтобы не прерывать игру
    }
  },

  // Подписаться на изменения игроков
  subscribeToPlayers: (callback: (players: Record<string, Player>) => void) => {
    const playersRef = ref(database, 'players');
    
    onValue(playersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        callback(data || {});
      } catch (error) {
        console.error('❌ Ошибка получения данных игроков:', error);
        callback({});
      }
    }, (error) => {
      console.error('❌ Ошибка подписки на игроков:', error);
      callback({});
    });

    return () => {
      off(playersRef);
      console.log('🔌 Отписка от обновлений игроков');
    };
  },

  // Удалить игрока
  removePlayer: async (playerId: string) => {
    try {
      const playerRef = ref(database, `players/${playerId}`);
      await remove(playerRef);
      console.log(`👋 Игрок ${playerId} покинул игру`);
    } catch (error) {
      console.error('❌ Ошибка удаления игрока:', error);
      throw error;
    }
  }
};

// Генерация случайного цвета
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
    '#2ECC71', '#F1C40F', '#E67E22', '#34495E', '#95A5A6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Проверка подключения к Firebase
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    const testRef = ref(database, '.info/connected');
    return new Promise((resolve) => {
      const unsubscribe = onValue(testRef, (snapshot) => {
        const connected = snapshot.val();
        unsubscribe();
        resolve(connected === true);
      });
    });
  } catch (error) {
    console.error('❌ Ошибка тестирования подключения:', error);
    return false;
  }
}; 