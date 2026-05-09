import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { interactionLogState } from '~/store/interactionLog';
import { cn } from '~/utils';

const InteractionLogPanel = memo(function InteractionLogPanel() {
  const interactions = useRecoilValue(interactionLogState);

  return (
    <div
      className={cn(
        'flex h-full w-1/2 flex-col overflow-hidden border-l border-border-light bg-surface-secondary',
        'transition-all duration-300 ease-in-out',
      )}
    >
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Лог взаимодействий
        </h3>
        <span className="text-xs text-text-secondary">
          {interactions.length} записей
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {interactions.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-secondary text-center">
              Начните диалог — здесь появится история взаимодействий
            </p>
          </div>
        ) : (
          interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="rounded-lg border border-border-light bg-surface-primary p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {new Date(interaction.timestamp).toLocaleTimeString('ru-RU')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 text-xs font-semibold text-blue-500">
                    Вы:
                  </span>
                  <p className="text-sm text-text-primary break-words">
                    {interaction.userMessage}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 text-xs font-semibold text-green-500">
                    Агент:
                  </span>
                  <p className="text-sm text-text-primary break-words">
                    {interaction.aiResponse}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

InteractionLogPanel.displayName = 'InteractionLogPanel';

export default InteractionLogPanel;
