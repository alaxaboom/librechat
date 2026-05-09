import { atom } from 'recoil';

export interface IInteraction {
  id: string;
  timestamp: number;
  userMessage: string;
  aiResponse: string;
}

export const interactionLogState = atom<IInteraction[]>({
  key: 'interactionLogState',
  default: [],
});
