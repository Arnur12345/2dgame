import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LoginForm } from './components/LoginForm';
import { GameField } from './components/GameField';
import { PlayerList } from './components/PlayerList';
import { useRealtimePlayers } from './hooks/useRealtimePlayers';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { generateRandomColor, type Player } from './services/localMultiplayer';
import './App.css';

// Константы игры
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const PLAYER_SIZE = 16; // 16px вместо 4px для лучшей видимости

interface GameState {
  isLoggedIn: boolean;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    isLoggedIn: false,
    currentPlayer: null,
    isLoading: false,
    error: null
  });

  // Хуки для игры
  const { 
    players, 
    isConnected, 
    addPlayer, 
    removePlayer 
  } = useRealtimePlayers();

  // Хук движения (создается только после входа в игру)
  const playerMovement = usePlayerMovement({
    playerId: gameState.currentPlayer?.id || '',
    fieldWidth: FIELD_WIDTH,
    fieldHeight: FIELD_HEIGHT,
    playerSize: PLAYER_SIZE
  });

  // Обработка входа в игру
  const handleLogin = useCallback(async (playerName: string) => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Создаем нового игрока
      const newPlayer: Player = {
        id: uuidv4(),
        name: playerName,
        color: generateRandomColor(),
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT / 2,
        timestamp: Date.now()
      };

      // Добавляем игрока в Firebase
      await addPlayer(newPlayer);

      // Устанавливаем начальную позицию в хуке движения
      playerMovement.setInitialPosition(newPlayer.x, newPlayer.y);

      // Обновляем состояние
      setGameState({
        isLoggedIn: true,
        currentPlayer: newPlayer,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Ошибка входа в игру:', error);
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Не удалось подключиться к игре. Проверьте интернет-соединение.'
      }));
    }
  }, [addPlayer, playerMovement]);

  // Обработка выхода из игры
  const handleLogout = useCallback(async () => {
    if (gameState.currentPlayer) {
      try {
        await removePlayer(gameState.currentPlayer.id);
      } catch (error) {
        console.error('Ошибка выхода из игры:', error);
      }
    }

    setGameState({
      isLoggedIn: false,
      currentPlayer: null,
      isLoading: false,
      error: null
    });
  }, [gameState.currentPlayer, removePlayer]);

  // Очистка при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState.currentPlayer) {
        removePlayer(gameState.currentPlayer.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (gameState.currentPlayer) {
        removePlayer(gameState.currentPlayer.id);
      }
    };
  }, [gameState.currentPlayer, removePlayer]);

  // Обработка ошибки подключения
  useEffect(() => {
    if (!isConnected && gameState.isLoggedIn) {
      setGameState(prev => ({
        ...prev,
        error: 'Потеряно соединение с сервером. Переподключение...'
      }));
    } else if (isConnected && gameState.error) {
      setGameState(prev => ({
        ...prev,
        error: null
      }));
    }
  }, [isConnected, gameState.isLoggedIn, gameState.error]);

  // Рендер экрана входа
  if (!gameState.isLoggedIn) {
    return (
      <div className="app">
        <LoginForm 
          onLogin={handleLogin} 
          isLoading={gameState.isLoading} 
        />
        {gameState.error && (
          <div className="error-message">
            ⚠️ {gameState.error}
          </div>
        )}
      </div>
    );
  }

  // Рендер игрового экрана
  return (
    <div className="app">
      <header className="game-header">
        <h1 className="game-title">🎮 2D Мультиплеер Игра</h1>
        <div className="header-controls">
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            🚪 Выйти
          </button>
        </div>
      </header>

      {gameState.error && (
        <div className="error-banner">
          ⚠️ {gameState.error}
        </div>
      )}

      <main className="game-main">
        <div className="game-area">
          <GameField 
            players={players}
            currentPlayerId={gameState.currentPlayer?.id || ''}
            fieldWidth={FIELD_WIDTH}
            fieldHeight={FIELD_HEIGHT}
            playerSize={PLAYER_SIZE}
          />
        </div>

        <aside className="game-sidebar">
          <PlayerList 
            players={players}
            currentPlayerId={gameState.currentPlayer?.id || ''}
            isConnected={isConnected}
          />
        </aside>
      </main>

      {/* Инструкции по управлению (только для мобильных) */}
      <div className="mobile-controls">
        <p>📱 На мобильном устройстве используйте внешнюю клавиатуру для управления (WASD)</p>
      </div>
    </div>
  );
}

export default App;
