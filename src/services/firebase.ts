// Firebase конфигурация и методы для игры
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, onDisconnect, remove } from 'firebase/database';

// Конфигурация Firebase для веб-приложения
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
    const playerRef = ref(database, `players/${player.id}`);
    await set(playerRef, player);
    
    // Автоматическое удаление при отключении
    const disconnectRef = onDisconnect(playerRef);
    await disconnectRef.remove();
  },

  // Обновить позицию игрока
  updatePlayerPosition: async (playerId: string, x: number, y: number) => {
    const playerRef = ref(database, `players/${playerId}/x`);
    await set(playerRef, x);
    const playerRefY = ref(database, `players/${playerId}/y`);
    await set(playerRefY, y);
    const timestampRef = ref(database, `players/${playerId}/timestamp`);
    await set(timestampRef, Date.now());
  },

  // Подписаться на изменения игроков
  subscribeToPlayers: (callback: (players: Record<string, Player>) => void) => {
    const playersRef = ref(database, 'players');
    
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });

    return () => off(playersRef);
  },

  // Удалить игрока
  removePlayer: async (playerId: string) => {
    const playerRef = ref(database, `players/${playerId}`);
    await remove(playerRef);
  }
};

// Генерация случайного цвета
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}; 