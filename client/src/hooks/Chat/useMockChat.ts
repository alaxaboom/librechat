import { useCallback, useRef } from 'react';
import { v4 } from 'uuid';
import { useSetRecoilState } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import { interactionLogState } from '~/store/interactionLog';

type TAskParams = {
  text: string;
  overrideConvoId?: string;
  overrideUserMessageId?: string;
  parentMessageId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
};

type TAskOptions = {
  editedContent?: unknown;
  editedMessageId?: string | null;
  isRegenerate?: boolean;
  isContinued?: boolean;
  isEdited?: boolean;
  overrideMessages?: TMessage[];
  overrideFiles?: unknown[];
  overrideManualSkills?: string[];
  addedConvo?: unknown;
};

type TAskFunction = (params: TAskParams, options?: TAskOptions) => void;

const MOCK_RESPONSE = 'ответ от агента!';

export default function useMockChat(originalAsk: TAskFunction) {
  const setInteractionLog = useSetRecoilState(interactionLogState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mockAsk: TAskFunction = useCallback(
    (params, options = {}) => {
      const userMessage = params.text?.trim();

      if (!userMessage) {
        return;
      }

      // Записываем взаимодействие в лог
      const interactionId = v4();
      const timestamp = Date.now();

      setInteractionLog((prev) => [
        ...prev,
        {
          id: interactionId,
          timestamp,
          userMessage: userMessage,
          aiResponse: MOCK_RESPONSE,
        },
      ]);

      // Вызываем оригинальный ask для обновления UI сообщений
      // Передаем специальные флаги чтобы backend не вызывался
      originalAsk(params, {
        ...options,
        // Добавляем флаг для mock-режима
        isMock: true,
      });

      // Останавливаем submitting state через небольшую задержку
      // чтобы UI показал анимацию "печатания"
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [originalAsk, setInteractionLog],
  );

  return mockAsk;
}
