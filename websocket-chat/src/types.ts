/* Сообщение в чате */
export interface Message {
  timestamp: number; // Отметка времени
  nickname: string; // Никнейм
  message: string; // Сообщение
}

// Тип действия - сообщить историю или новое сообщение
export type WebSocketAction = 'history' | 'send';