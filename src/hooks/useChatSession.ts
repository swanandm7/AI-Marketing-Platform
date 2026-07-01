/**
 * Chat session state.
 * On first load with no saved session, seeds two example conversation blocks
 * (matching the design spec) so the UI looks populated immediately.
 */
import { useReducer, useCallback, useEffect } from 'react';
import type { ConversationBlock, BlockPhase, ChartSpec, DataTableSpec } from '@/types';
import { streamQuery } from '@/api/stream';

// ── Mock seed data (mirrors the HTML prototype) ─────────────────

const SEED_BLOCKS: ConversationBlock[] = [
  {
    id: 1,
    query: 'Why did organic traffic drop on the NMIMS page?',
    sources: ['gsc', 'ga4'],
    querying: 'Search Console',
    time: '09:48',
    phase: 'done',
    shown:
      'Organic sessions to the **NMIMS Online MBA** page fell **−31%** between 28 May and 4 Jun. The cause is ranking, not demand — impressions held flat while average position slid from 3.1 to 6.4. This lines up with a Google core update rollout on 30 May. Two competitor pages overtook you on **"nmims online mba fees"**. The page hasn\'t been updated since March; a freshness pass should recover most of it.',
    text: 'Organic sessions to the **NMIMS Online MBA** page fell **−31%** between 28 May and 4 Jun. The cause is ranking, not demand — impressions held flat while average position slid from 3.1 to 6.4. This lines up with a Google core update rollout on 30 May. Two competitor pages overtook you on **"nmims online mba fees"**. The page hasn\'t been updated since March; a freshness pass should recover most of it.',
    chart: {
      type: 'line',
      caption: 'Organic sessions · NMIMS Online MBA page · last 14 days',
      unit: '',
      source: 'gsc',
      annotation: { index: 9, label: 'Core update' },
      data: [
        { label: '22 May', value: 1320 },
        { label: '23', value: 1290 },
        { label: '24', value: 1355 },
        { label: '25', value: 1410 },
        { label: '26', value: 1380 },
        { label: '27', value: 1340 },
        { label: '28', value: 1365 },
        { label: '29', value: 1290 },
        { label: '30', value: 1180 },
        { label: '31', value: 980 },
        { label: '1 Jun', value: 910 },
        { label: '2', value: 880 },
        { label: '3', value: 940 },
        { label: '4', value: 945 },
      ],
    },
    table: null,
  },
  {
    id: 2,
    query: 'What are my top 5 organic queries this month?',
    sources: ['gsc'],
    querying: 'Search Console',
    time: '09:51',
    phase: 'done',
    shown:
      'Your top organic queries this month are dominated by distance-MBA intent. **"online mba india"** is your single biggest driver with **8,420 clicks** at a 6.1% CTR. Position on **"nmims online mba"** improved to 3.2 after last month\'s content refresh. The opportunity sits with **"mba without entrance exam"** — strong impressions but a soft 3.9% CTR suggests the title tag isn\'t matching intent.',
    text: 'Your top organic queries this month are dominated by distance-MBA intent. **"online mba india"** is your single biggest driver with **8,420 clicks** at a 6.1% CTR. Position on **"nmims online mba"** improved to 3.2 after last month\'s content refresh. The opportunity sits with **"mba without entrance exam"** — strong impressions but a soft 3.9% CTR suggests the title tag isn\'t matching intent.',
    chart: null,
    table: {
      caption: 'Top organic queries · last 28 days · Search Console',
      source: 'gsc',
      columns: [
        { key: 'query', label: 'Query', align: 'left' },
        { key: 'clicks', label: 'Clicks', align: 'right', mono: true },
        { key: 'impr', label: 'Impr.', align: 'right', mono: true },
        { key: 'ctr', label: 'CTR', align: 'right', mono: true },
        { key: 'pos', label: 'Pos.', align: 'right', mono: true },
      ],
      rows: [
        { query: 'online mba india', clicks: '8,420', impr: '138,200', ctr: '6.1%', pos: '2.4', tone: { ctr: 'up' } },
        { query: 'nmims online mba', clicks: '5,190', impr: '74,600', ctr: '7.0%', pos: '3.2', tone: { pos: 'up' } },
        { query: 'distance mba', clicks: '4,030', impr: '96,400', ctr: '4.2%', pos: '5.1', tone: {} },
        { query: 'mba without entrance exam', clicks: '2,870', impr: '73,900', ctr: '3.9%', pos: '6.8', tone: { ctr: 'down' } },
        { query: 'executive mba bangalore', clicks: '1,640', impr: '41,200', ctr: '4.0%', pos: '4.6', tone: {} },
      ],
    },
  },
];

const SEED_HISTORY = [
  'Why did organic traffic drop on the NMIMS page?',
  'Where are users rage-clicking this week?',
  'Which campaign had the lowest CPL last week?',
  'How many leads came from Meta vs Google Ads?',
  'What are my top 5 organic queries this month?',
];

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
          dispatch({ type: 'RESTORE', blocks: restored, history: saved.history ?? SEED_HISTORY });
          return;
        }
      }
    } catch {
      // ignore
    }
    dispatch({ type: 'RESTORE', blocks: SEED_BLOCKS, history: SEED_HISTORY });
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
