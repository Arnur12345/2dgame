// Компонент списка активных игроков
import React from 'react';
import { type Player } from '../services/firebase';

interface PlayerListProps {
  players: Record<string, Player>;
  currentPlayerId: string;
  isConnected: boolean;
}

export const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  currentPlayerId, 
  isConnected 
}) => {
  const playersArray = Object.values(players);
  const currentPlayer = players[currentPlayerId];

  return (
    <div className="player-list">
      <div className="connection-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </span>
        <span className="status-text">
          {isConnected ? 'Подключено' : 'Отключено'}
        </span>
      </div>

      <div className="players-header">
        <h3>👥 Игроки онлайн ({playersArray.length})</h3>
      </div>

      <div className="players-container">
        {playersArray.length === 0 ? (
          <div className="no-players">
            <p>🤔 Пока никого нет...</p>
          </div>
        ) : (
          <ul className="players-list">
            {playersArray.map((player) => (
              <li 
                key={player.id} 
                className={`player-item ${player.id === currentPlayerId ? 'current-player' : ''}`}
              >
                <div className="player-info">
                  <div 
                    className="player-color" 
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="player-name">
                    {player.name}
                    {player.id === currentPlayerId && ' (Вы)'}
                  </span>
                </div>
                <div className="player-position">
                  <span className="coordinates">
                    ({Math.round(player.x)}, {Math.round(player.y)})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {currentPlayer && (
        <div className="current-player-info">
          <h4>🎯 Ваш игрок</h4>
          <div className="player-details">
            <div className="detail-row">
              <span>Имя:</span>
              <span>{currentPlayer.name}</span>
            </div>
            <div className="detail-row">
              <span>Цвет:</span>
              <div 
                className="color-preview" 
                style={{ backgroundColor: currentPlayer.color }}
              />
            </div>
            <div className="detail-row">
              <span>Позиция:</span>
              <span>({Math.round(currentPlayer.x)}, {Math.round(currentPlayer.y)})</span>
            </div>
          </div>
        </div>
      )}

      <div className="controls-hint">
        <h4>⌨️ Управление</h4>
        <div className="controls-grid">
          <div></div>
          <div className="key">W</div>
          <div></div>
          <div className="key">A</div>
          <div className="key">S</div>
          <div className="key">D</div>
        </div>
      </div>
    </div>
  );
}; 