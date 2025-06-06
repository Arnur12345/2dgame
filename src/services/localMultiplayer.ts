// Локальная система мультиплеера для демонстрации без Firebase
// Использует локальное хранилище и события окна для симуляции реального времени

export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  timestamp: number;
}

type PlayersCallback = (players: Record<string, Player>) => void;

class LocalMultiplayerService {
  private players: Record<string, Player> = {};
  private callbacks: Set<PlayersCallback> = new Set();
  private storageKey = 'local-2d-game-players';
  
  constructor() {
    // Загружаем игроков из локального хранилища
    this.loadPlayersFromStorage();
    
    // Слушаем изменения в других вкладках
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Очищаем старых игроков при запуске
    this.cleanupOldPlayers();
    
    // Периодически очищаем старых игроков
    setInterval(() => this.cleanupOldPlayers(), 5000);
  }

  private loadPlayersFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.players = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Ошибка загрузки данных из localStorage:', error);
      this.players = {};
    }
  }

  private savePlayersToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.players));
      
      // Уведомляем другие вкладки
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.storageKey,
        newValue: JSON.stringify(this.players),
        storageArea: localStorage
      }));
    } catch (error) {
      console.warn('Ошибка сохранения в localStorage:', error);
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === this.storageKey && event.newValue) {
      try {
        this.players = JSON.parse(event.newValue);
        this.notifyCallbacks();
      } catch (error) {
        console.warn('Ошибка обработки изменений localStorage:', error);
      }
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.players);
      } catch (error) {
        console.warn('Ошибка в callback:', error);
      }
    });
  }

  private cleanupOldPlayers() {
    const now = Date.now();
    const timeout = 30000; // 30 секунд
    let hasChanges = false;

    Object.keys(this.players).forEach(playerId => {
      if (now - this.players[playerId].timestamp > timeout) {
        delete this.players[playerId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.savePlayersToStorage();
      this.notifyCallbacks();
    }
  }

  // Добавить игрока
  async addPlayer(player: Player): Promise<void> {
    this.players[player.id] = { ...player, timestamp: Date.now() };
    this.savePlayersToStorage();
    this.notifyCallbacks();
    
    // Симуляция сетевой задержки
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Обновить позицию игрока
  async updatePlayerPosition(playerId: string, x: number, y: number): Promise<void> {
    if (this.players[playerId]) {
      this.players[playerId].x = x;
      this.players[playerId].y = y;
      this.players[playerId].timestamp = Date.now();
      
      this.savePlayersToStorage();
      this.notifyCallbacks();
    }
    
    // Симуляция сетевой задержки
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Подписаться на изменения игроков
  subscribeToPlayers(callback: PlayersCallback): () => void {
    this.callbacks.add(callback);
    
    // Сразу вызываем callback с текущими данными
    callback(this.players);
    
    // Возвращаем функцию отписки
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Удалить игрока
  async removePlayer(playerId: string): Promise<void> {
    if (this.players[playerId]) {
      delete this.players[playerId];
      this.savePlayersToStorage();
      this.notifyCallbacks();
    }
    
    // Симуляция сетевой задержки
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Очистить всех игроков (для разработки)
  clearAllPlayers(): void {
    this.players = {};
    this.savePlayersToStorage();
    this.notifyCallbacks();
  }

  // Добавить ботов для демонстрации
  addDemoBots(): void {
    const botColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const botNames = ['Бот Алекс', 'Бот Мария', 'Бот Иван', 'Бот Анна'];
    
    botNames.forEach((name, index) => {
      if (Object.keys(this.players).length < 6) { // Максимум 6 игроков
        const bot: Player = {
          id: `bot-${index}`,
          name,
          color: botColors[index % botColors.length],
          x: 100 + (index * 150),
          y: 100 + (index * 100),
          timestamp: Date.now()
        };
        
        this.players[bot.id] = bot;
      }
    });
    
    this.savePlayersToStorage();
    this.notifyCallbacks();
    
    // Анимируем ботов
    this.animateBots();
  }

  private animateBots(): void {
    const botIds = Object.keys(this.players).filter(id => id.startsWith('bot-'));
    
    if (botIds.length === 0) return;
    
    const animate = () => {
      let hasChanges = false;
      
      botIds.forEach(botId => {
        const bot = this.players[botId];
        if (bot) {
          // Случайное движение
          const deltaX = (Math.random() - 0.5) * 4;
          const deltaY = (Math.random() - 0.5) * 4;
          
          const newX = Math.max(8, Math.min(792, bot.x + deltaX));
          const newY = Math.max(8, Math.min(592, bot.y + deltaY));
          
          if (Math.abs(newX - bot.x) > 0.1 || Math.abs(newY - bot.y) > 0.1) {
            bot.x = newX;
            bot.y = newY;
            bot.timestamp = Date.now();
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        this.savePlayersToStorage();
        this.notifyCallbacks();
      }
      
      // Продолжаем анимацию
      if (botIds.some(id => this.players[id])) {
        setTimeout(animate, 200 + Math.random() * 300);
      }
    };
    
    // Запускаем анимацию с задержкой
    setTimeout(animate, 1000);
  }
}

// Создаем единственный экземпляр сервиса
const localMultiplayerService = new LocalMultiplayerService();

// Экспортируем сервис с тем же интерфейсом, что и Firebase
export const playerService = {
  addPlayer: localMultiplayerService.addPlayer.bind(localMultiplayerService),
  updatePlayerPosition: localMultiplayerService.updatePlayerPosition.bind(localMultiplayerService),
  subscribeToPlayers: localMultiplayerService.subscribeToPlayers.bind(localMultiplayerService),
  removePlayer: localMultiplayerService.removePlayer.bind(localMultiplayerService)
};

// Дополнительные методы для демо
export const demoService = {
  clearAllPlayers: localMultiplayerService.clearAllPlayers.bind(localMultiplayerService),
  addDemoBots: localMultiplayerService.addDemoBots.bind(localMultiplayerService)
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