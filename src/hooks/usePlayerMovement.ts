// Хук для управления движением игрока
import { useState, useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { playerService } from '../services/localMultiplayer';

interface UsePlayerMovementProps {
  playerId: string;
  fieldWidth: number;
  fieldHeight: number;
  playerSize: number;
}

export const usePlayerMovement = ({ 
  playerId, 
  fieldWidth, 
  fieldHeight, 
  playerSize 
}: UsePlayerMovementProps) => {
  const [position, setPosition] = useState({ x: fieldWidth / 2, y: fieldHeight / 2 });
  const [isMoving, setIsMoving] = useState(false);

  // Скорость движения (пикселей за нажатие)
  const MOVE_SPEED = 4;

  // Функция для обновления позиции с ограничениями
  const updatePosition = useCallback(async (deltaX: number, deltaY: number) => {
    setPosition(prevPos => {
      const newX = Math.max(
        playerSize / 2, 
        Math.min(fieldWidth - playerSize / 2, prevPos.x + deltaX)
      );
      const newY = Math.max(
        playerSize / 2, 
        Math.min(fieldHeight - playerSize / 2, prevPos.y + deltaY)
      );

      // Отправляем новую позицию в Firebase только если она изменилась
      if (newX !== prevPos.x || newY !== prevPos.y) {
        playerService.updatePlayerPosition(playerId, newX, newY);
      }

      return { x: newX, y: newY };
    });
  }, [playerId, fieldWidth, fieldHeight, playerSize]);

  // Обработка клавиш движения
  useHotkeys('w', () => {
    setIsMoving(true);
    updatePosition(0, -MOVE_SPEED);
    setTimeout(() => setIsMoving(false), 100);
  }, { preventDefault: true });

  useHotkeys('s', () => {
    setIsMoving(true);
    updatePosition(0, MOVE_SPEED);
    setTimeout(() => setIsMoving(false), 100);
  }, { preventDefault: true });

  useHotkeys('a', () => {
    setIsMoving(true);
    updatePosition(-MOVE_SPEED, 0);
    setTimeout(() => setIsMoving(false), 100);
  }, { preventDefault: true });

  useHotkeys('d', () => {
    setIsMoving(true);
    updatePosition(MOVE_SPEED, 0);
    setTimeout(() => setIsMoving(false), 100);
  }, { preventDefault: true });

  // Функция для установки начальной позиции
  const setInitialPosition = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  return {
    position,
    isMoving,
    setInitialPosition
  };
}; 