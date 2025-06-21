import React, { useState, useEffect } from 'react';
import { Message, WebSocketAction } from './types';
import Chat from './components/Chat';
import MessageInput from './components/MessageInput';
// Главный компонент
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Управляемые свойства - массив сообщений
  const [socket, setSocket] = useState<WebSocket | null>(null); // Соединение до сервера
  // Асинхронные соединения всегда внутри useEffect
  useEffect(() => {
    // Создаем соединение до вебсокета на бекенде
    const ws = new WebSocket('ws://127.0.0.1:8081');  

    ws.onopen = () => {
      // отображаем, что соединение установлено
      console.log('WebSocket connection established');
      // Запрашиваем у бекенда историю сообщений
      ws.send(JSON.stringify({ action: 'history' }));
    };
    // еси пришло новое сообщение
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // преобразуем данные в JSON
        setMessages(prev => [...prev, data]); // добавим новое сообщение
      } catch (error) { // возможна ошибка парсинга JSON
        console.error('Error parsing message:', error);
      }
    };
    // Обработчик ошибки сокета
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    // Обработчик закрытия сокета
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    // Устанавливаем сокет
    setSocket(ws);
    // При потере связи закрыть сокет
    return () => {
      ws.close();
    };
  }, []);

  // Обработчик отправки сообщения
  const handleSend = (nickname: string, message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) { // если сокет открыт
      socket.send(JSON.stringify({ // отправяем JSON в сериализованном виде
        action: 'send',
        nickname: nickname,
        message: message
      }));
    }
  };

  return (
    <div>
      <h1>WebSocket чат</h1>
      <Chat messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default App;