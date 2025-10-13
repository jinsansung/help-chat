export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface KnowledgeFile {
  id: string;
  fileName: string;
}
