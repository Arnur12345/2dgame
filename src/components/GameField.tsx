// Основной компонент игрового поля
import React, { useRef, useEffect, useCallback } from 'react';
import { type Player } from '../services/firebase';

interface GameFieldProps {
  players: Record<string, Player>;
  currentPlayerId: string;
  fieldWidth: number;
  fieldHeight: number;
  playerSize: number;
}

export const GameField: React.FC<GameFieldProps> = ({
  players,
  currentPlayerId,
  fieldWidth,
  fieldHeight,
  playerSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Функция отрисовки игрового поля
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);

    // Рисуем фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, fieldWidth, fieldHeight);

    // Рисуем сетку (опционально)
    ctx.strokeStyle = '#2d2d44';
    ctx.lineWidth = 0.5;
    
    // Вертикальные линии
    for (let x = 0; x <= fieldWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, fieldHeight);
      ctx.stroke();
    }
    
    // Горизонтальные линии
    for (let y = 0; y <= fieldHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(fieldWidth, y);
      ctx.stroke();
    }

    // Рисуем границы поля
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, fieldWidth, fieldHeight);

    // Рисуем всех игроков
    Object.values(players).forEach((player) => {
      // Основной квадратик игрока
      ctx.fillStyle = player.color;
      ctx.fillRect(
        player.x - playerSize / 2,
        player.y - playerSize / 2,
        playerSize,
        playerSize
      );

      // Подсветка для текущего игрока
      if (player.id === currentPlayerId) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          player.x - playerSize / 2 - 2,
          player.y - playerSize / 2 - 2,
          playerSize + 4,
          playerSize + 4
        );
        
        // Дополнительный внешний контур
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          player.x - playerSize / 2 - 4,
          player.y - playerSize / 2 - 4,
          playerSize + 8,
          playerSize + 8
        );
      }

      // Рисуем имя игрока над квадратиком
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        player.name,
        player.x,
        player.y - playerSize / 2 - 8
      );

      // Тень для текста
      ctx.fillStyle = '#000000';
      ctx.fillText(
        player.name,
        player.x + 1,
        player.y - playerSize / 2 - 7
      );
      
      // Белый текст поверх тени
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        player.name,
        player.x,
        player.y - playerSize / 2 - 8
      );
    });
  }, [players, currentPlayerId, fieldWidth, fieldHeight, playerSize]);

  // Отрисовка при изменении игроков
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  // Обработка изменения размера canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Устанавливаем размеры canvas
    canvas.width = fieldWidth;
    canvas.height = fieldHeight;
    
    // Настройки для четкой отрисовки
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }

    drawGame();
  }, [fieldWidth, fieldHeight, drawGame]);

  return (
    <div className="game-field-container">
      <div className="game-field-wrapper">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={fieldWidth}
          height={fieldHeight}
          tabIndex={0}
        />
        
        {/* Информация о поле */}
        <div className="field-info">
          <span>Размер поля: {fieldWidth} × {fieldHeight} px</span>
          <span>Игроков онлайн: {Object.keys(players).length}</span>
        </div>
      </div>
    </div>
  );
}; 