import { useState, useCallback } from 'react';
import { Message } from '../types';
import { getChatbotResponse } from '../services/geminiService';

const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: '안녕하세요. 궁금한 점은 뭐든 말씀해주세요.',
      sender: 'bot',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(userInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response from Gemini:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 답변을 생성하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  return {
    messages,
    userInput,
    isLoading,
    handleInputChange,
    handleSubmit,
  };
};

export default useChat;