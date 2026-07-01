import { useRef, useEffect } from 'react';
import { extractErrorMessage } from '@/api/client';
import { useChatSession } from '@/hooks/useChatSession';
import { EmptyState } from '@/components/Chat/EmptyState';
import { ResponseBlock } from '@/components/Chat/ResponseBlock';
import { ChatInput } from '@/components/Chat/ChatInput';
import { Sidebar } from '@/components/Sidebar';

export function HubPage() {
  const {
    blocks,
    history,
    busy,
    queryingName,
    startQuery,
    handleStream,
    failQuery,
    newSession,
  } = useChatSession();

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (blocks.length > 0) scrollToBottom();
  }, [blocks.length]);

  const handleQuery = async (question: string) => {
    if (busy) return;
    const blockId = startQuery(question);
    scrollToBottom();

    try {
      await handleStream(blockId, question);
      scrollToBottom();
    } catch (err) {
      failQuery(blockId, extractErrorMessage(err));
    }
  };

  return (
    <>
      <Sidebar history={history} onRun={handleQuery} onNew={newSession} />
      <main className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[880px] mx-auto px-9 py-7 min-h-full">
            {blocks.length === 0 ? (
              <EmptyState onPick={handleQuery} />
            ) : (
              blocks.map((block) => (
                <ResponseBlock key={block.id} block={block} />
              ))
            )}
          </div>
        </div>
        <ChatInput onSend={handleQuery} busy={busy} queryingName={queryingName} />
      </main>
    </>
  );
}
