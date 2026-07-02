/**
 * Chat session state.
 * On first load with no saved session, seeds two example conversation blocks
 * (matching the design spec) so the UI looks populated immediately.
 */
import { useReducer, useCallback, useEffect } from 'react';
import type { ConversationBlock, BlockPhase, ChartSpec, DataTableSpec } from '@/types';
import { streamQuery } from '@/api/stream';



// ── State ────────────────────────────────────────────────────────

interface SessionState {
  blocks: ConversationBlock[];
  history: string[];
  busy: boolean;
  queryingName: string;
}

type SessionAction =
  | { type: 'ADD_BLOCK'; block: ConversationBlock }
  | { type: 'UPDATE_BLOCK'; id: number; patch: Partial<ConversationBlock> }
  | { type: 'APPEND_TOKEN'; id: number; text: string }
  | { type: 'FINALIZE_STREAM'; id: number; chart: ChartSpec | null; table: DataTableSpec | null }
  | { type: 'ADD_HISTORY'; query: string }
  | { type: 'SET_BUSY'; busy: boolean; queryingName?: string }
  | { type: 'NEW_SESSION' }
  | { type: 'RESTORE'; blocks: ConversationBlock[]; history: string[] };

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'ADD_BLOCK':
      return { ...state, blocks: [...state.blocks, action.block] };
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id ? { ...b, ...action.patch } : b,
        ),
      };
    case 'APPEND_TOKEN':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id ? { ...b, shown: b.shown + action.text } : b,
        ),
      };
    case 'FINALIZE_STREAM':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id
            ? { ...b, phase: 'done', text: b.shown, chart: action.chart, table: action.table }
            : b,
        ),
      };
    case 'ADD_HISTORY':
      return {
        ...state,
        history: [
          action.query,
          ...state.history.filter((h) => h !== action.query),
        ].slice(0, 20),
      };
    case 'SET_BUSY':
      return {
        ...state,
        busy: action.busy,
        queryingName: action.queryingName ?? state.queryingName,
      };
    case 'NEW_SESSION':
      return { ...state, blocks: [], busy: false, queryingName: '' };
    case 'RESTORE':
      return { ...state, blocks: action.blocks, history: action.history };
    default:
      return state;
  }
}

const STORAGE_KEY = 'db_hub_v2';
let _blockId = 2;

function nextId() {
  return ++_blockId;
}

// ── Hook ────────────────────────────────────────────────────────

export function useChatSession() {
  const [state, dispatch] = useReducer(reducer, {
    blocks: [],
    history: [],
    busy: false,
    queryingName: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          blocks: ConversationBlock[];
          history: string[];
        };
        if (saved.blocks?.length) {
          const restored = saved.blocks.map((b) => ({
            ...b,
            phase: 'done' as BlockPhase,
            shown: b.text,
          }));
          dispatch({ type: 'RESTORE', blocks: restored, history: saved.history ?? [] });
          return;
        }
      }
    } catch {
      // ignore
    }
    dispatch({ type: 'RESTORE', blocks: [], history: [] });
  }, []);

  useEffect(() => {
    if (state.busy) return;
    try {
      const done = state.blocks.filter((b) => b.phase === 'done');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks: done, history: state.history }));
    } catch {
      // ignore
    }
  }, [state.busy, state.blocks, state.history]);

  const startQuery = useCallback((query: string): number => {
    const id = nextId();
    const time = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    dispatch({
      type: 'ADD_BLOCK',
      block: {
        id, query, sources: [], querying: '…', time,
        text: '', chart: null, table: null, phase: 'querying', shown: '',
      },
    });
    dispatch({ type: 'SET_BUSY', busy: true, queryingName: '…' });
    dispatch({ type: 'ADD_HISTORY', query });
    return id;
  }, []);

  const handleStream = useCallback(async (id: number, question: string) => {
    try {
      for await (const event of streamQuery(question)) {
        switch (event.type) {
          case 'querying':
            dispatch({
              type: 'UPDATE_BLOCK',
              id,
              patch: {
                sources: event.sources,
                querying: event.querying,
                phase: 'streaming',
                shown: '',
              },
            });
            dispatch({ type: 'SET_BUSY', busy: true, queryingName: event.querying });
            break;
          case 'token':
            dispatch({ type: 'APPEND_TOKEN', id, text: event.text });
            break;
          case 'done':
            dispatch({ type: 'FINALIZE_STREAM', id, chart: event.chart, table: event.table });
            dispatch({ type: 'SET_BUSY', busy: false });
            break;
          case 'error':
            dispatch({
              type: 'UPDATE_BLOCK',
              id,
              patch: { phase: 'error', shown: event.message, error: event.message },
            });
            dispatch({ type: 'SET_BUSY', busy: false });
            break;
        }
      }
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Connection failed';
      dispatch({
        type: 'UPDATE_BLOCK',
        id,
        patch: { phase: 'error', shown: message, error: message },
      });
      dispatch({ type: 'SET_BUSY', busy: false });
    }
  }, []);

  const failQuery = useCallback((id: number, message: string) => {
    dispatch({ type: 'UPDATE_BLOCK', id, patch: { phase: 'error', shown: message, error: message } });
    dispatch({ type: 'SET_BUSY', busy: false });
  }, []);

  const newSession = useCallback(() => {
    dispatch({ type: 'NEW_SESSION' });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks: [], history: state.history }));
    } catch {
      // ignore
    }
  }, [state.history]);

  return {
    blocks: state.blocks,
    history: state.history,
    busy: state.busy,
    queryingName: state.queryingName,
    startQuery,
    handleStream,
    failQuery,
    newSession,
  };
}
