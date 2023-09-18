export type EventSourceEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'timeout'
  // FIXME: rename suspend to idle
  | 'suspend';

export type EventCallback = (data: EventSourceEvent) => void;

export type EventSourceEvent =
  | MessageEvent
  | TimeoutEvent
  | ErrorEvent
  | CloseEvent
  | OpenEvent;

/**
 * event that emitted when message event received
 */
export interface MessageEvent {
  type: 'message';
  data: string;
  lastEventId: string | null | undefined;
}

/**
 * event that emitted when timeout occurred before first message event
 */
export interface TimeoutEvent {
  type: 'timeout';
}

/**
 * event that emitted when first message event received
 */
export interface OpenEvent {
  type: 'open';
}

/**
 * event that emitted when connection closed
 */
export interface CloseEvent {
  type: 'close';
}

/**
 * event that emitted when error occurred
 */
export interface ErrorEvent {
  type: 'error';
  data: unknown;
  message: string | null | undefined;
  statusCode: number | null | undefined;
}

/**
 * TODO: idle
 * event that emitted when no message event for a while
 */
// export interface IdleEvent {
//   type: 'idle';
// }

export type HttpMethod = 'GET' | 'POST';

export type EventSourceHttpOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, string>;
  timeout?: number;
  debug?: boolean;
};

export type EventSourceStreamOptions = {
  speed?: number;
};
