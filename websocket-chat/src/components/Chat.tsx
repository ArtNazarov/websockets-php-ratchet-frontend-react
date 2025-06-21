/* Импорт библиотек */
import React from 'react';
import { Message } from '../types';
/* Чат будет содержать массив сообщений */
interface ChatProps {
  messages: Message[];
}
/* Компонент для отображения списка сообщений в чате */
const Chat: React.FC<ChatProps> = ({ messages }) => {
  return (
    <div style={{
      width: '400px',
      height: '300px',
      border: '1px solid #ccc',
      overflowY: 'auto',
      padding: '10px',
      fontFamily: 'monospace',
      backgroundColor: '#f9f9f9'
    }}>
      {messages.map((msg, index) => {
        const ts = new Date(parseInt(msg.timestamp.toString()));
        const timeStr = ts.toLocaleTimeString();
        
        return (
          <div key={index}>
            [{timeStr}] <b>{msg.nickname}:</b> {msg.message}
          </div>
        );
      })}
    </div>
  );
};

export default Chat;