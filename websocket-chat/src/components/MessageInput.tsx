import React, { useState } from 'react';
/* Интерфейс отправки сообщений */
interface MessageInputProps {
  onSend: (nickname: string, message: string) => void;
}
/* Компонент для отображения формы ввода нового сообщения */
const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [nickname, setNickname] = useState(''); // Управляемые поля ввода
  const [message, setMessage] = useState(''); // с начальным пустым состоянием

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // предотвращаем переадресацию
    if (nickname.trim() && message.trim()) { // если оба не пустые
      onSend(nickname, message); // вызываем обработчик отправки
      setMessage(''); // стираем сообщение в форме
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
      <div>
        <label>
          Ник: 
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
          />
        </label>
      </div>
      <div>
        <label>
          Сообщение: 
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '300px' }}
          />
        </label>
        <button type="submit">Отправить</button>
      </div>
    </form>
  );
};

export default MessageInput;