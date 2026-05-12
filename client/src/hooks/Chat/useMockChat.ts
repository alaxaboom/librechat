import { useCallback, useRef } from 'react';
import { v4 } from 'uuid';
import { useSetRecoilState } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import { interactionLogState } from '~/store/interactionLog';
import { useAuthContext } from '~/hooks';
import { useMutation } from '@tanstack/react-query';
import { QueryKeys } from 'librechat-data-provider';

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
  const { user } = useAuthContext();

  // Мутация для отправки моковых данных на сервер
  const mockLogMutation = useMutation({
    mutationFn: async (data: { conversationId: string | null; userMessage: string; aiResponse: string; isTemporary?: boolean }) => {
      const response = await fetch('/api/messages/mock-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to log mock data');
      }
      return response.json();
    },
  });

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

      // Отправляем моковые данные на сервер для логирования
      mockLogMutation.mutate({
        conversationId: params.conversationId || null,
        userMessage: userMessage,
        aiResponse: MOCK_RESPONSE,
        isTemporary: false,
      });

      // Вызываем оригинальный ask для обновления UI сообщений
      // Передаем специальные флаги чтобы backend не вызывался
      originalAsk(params, {
        ...options,
        // Добавляем флаг для mock-режима
        isMock: true,
      } as any);

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
