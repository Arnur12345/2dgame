// Компонент формы входа в игру
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (playerName: string) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    
    if (trimmedName.length >= 2 && trimmedName.length <= 20) {
      onLogin(trimmedName);
    }
  };

  const isValidName = playerName.trim().length >= 2 && playerName.trim().length <= 20;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🎮 2D Мультиплеер Игра</h1>
        <p className="login-subtitle">
          Присоединяйтесь к игре! Управляйте своим квадратиком с помощью клавиш WASD.
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="playerName" className="input-label">
              Ваше имя
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Введите ваше имя..."
              className="name-input"
              maxLength={20}
              autoFocus
              disabled={isLoading}
            />
            <div className="input-hint">
              {playerName.length > 0 && (
                <span className={isValidName ? 'valid' : 'invalid'}>
                  {playerName.trim().length}/20 символов
                  {!isValidName && ' (минимум 2 символа)'}
                </span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="join-button"
            disabled={!isValidName || isLoading}
          >
            {isLoading ? '🔄 Подключение...' : '🚀 Войти в игру'}
          </button>
        </form>

        <div className="game-info">
          <h3>📋 Как играть:</h3>
          <ul>
            <li><strong>W</strong> - Движение вверх</li>
            <li><strong>A</strong> - Движение влево</li>
            <li><strong>S</strong> - Движение вниз</li>
            <li><strong>D</strong> - Движение вправо</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 