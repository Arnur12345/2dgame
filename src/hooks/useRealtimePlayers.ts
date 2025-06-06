// Хук для работы с игроками в реальном времени
import { useState, useEffect, useCallback } from 'react';
import { type Player, playerService } from '../services/localMultiplayer';

export const useRealtimePlayers = () => {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Подписываемся на изменения игроков
    const unsubscribe = playerService.subscribeToPlayers((playersData) => {
      setPlayers(playersData);
      setIsConnected(true);
    });

    // Очистка подписки при размонтировании
    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  // Добавить игрока
  const addPlayer = useCallback(async (player: Player) => {
    try {
      await playerService.addPlayer(player);
    } catch (error) {
      console.error('Ошибка добавления игрока:', error);
    }
  }, []);

  // Обновить позицию игрока
  const updatePlayerPosition = useCallback(async (playerId: string, x: number, y: number) => {
    try {
      await playerService.updatePlayerPosition(playerId, x, y);
    } catch (error) {
      console.error('Ошибка обновления позиции:', error);
    }
  }, []);

  // Удалить игрока
  const removePlayer = useCallback(async (playerId: string) => {
    try {
      await playerService.removePlayer(playerId);
    } catch (error) {
      console.error('Ошибка удаления игрока:', error);
    }
  }, []);

  // Получить список игроков как массив
  const getPlayersArray = useCallback(() => {
    return Object.values(players);
  }, [players]);

  // Получить конкретного игрока
  const getPlayer = useCallback((playerId: string) => {
    return players[playerId];
  }, [players]);

  // Получить количество активных игроков
  const getPlayersCount = useCallback(() => {
    return Object.keys(players).length;
  }, [players]);

  return {
    players,
    isConnected,
    addPlayer,
    updatePlayerPosition,
    removePlayer,
    getPlayersArray,
    getPlayer,
    getPlayersCount
  };
}; 