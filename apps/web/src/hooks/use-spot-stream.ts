'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MetalSpot, SpotStatus, SpotStreamEvent } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'stale';

interface SpotStreamState {
  spots: MetalSpot[];
  status: SpotStatus | null;
  connectionStatus: ConnectionStatus;
}

export function useSpotStream() {
  const [state, setState] = useState<SpotStreamState>({
    spots: [],
    status: null,
    connectionStatus: 'connecting',
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectDelay = 30_000;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState((prev) => ({ ...prev, connectionStatus: 'connecting' }));

    const es = new EventSource(`${API_BASE_URL}/api/spot/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      reconnectAttempts.current = 0;
      setState((prev) => ({ ...prev, connectionStatus: 'connected' }));
    };

    es.onmessage = (event) => {
      try {
        const data: SpotStreamEvent = JSON.parse(event.data);

        if (data.type === 'spot.update' && data.payload.spots) {
          setState({
            spots: data.payload.spots,
            status: (data.payload.status as SpotStatus) || null,
            connectionStatus: 'connected',
          });
        } else if (data.type === 'system.status') {
          setState((prev) => ({
            ...prev,
            status: (data.payload.status as SpotStatus) || prev.status,
            connectionStatus: 'stale',
          }));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }));

      // Exponential backoff reconnect
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, maxReconnectDelay);
      reconnectAttempts.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return state;
}
