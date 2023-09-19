export abstract class IEventSource {
  protected url: string;

  protected lastEventId: string | undefined;

  protected config: EventSourceHttpConfig;

  protected listeners: Record<EventSourceEventType, EventCallback[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
    timeout: [],
  };

  constructor(url: string, options?: EventSourceHttpConfig) {
    if (typeof url !== 'string' || !url) {
      throw new TypeError('[EventSource] invalid url');
    }

    this.url = url;

    this.config = {
      debug: options?.debug ?? false,
      method: options?.method ?? 'GET',
      body:
        options?.method === 'POST' && options?.body ? options.body : undefined,
      headers: options?.headers ?? {},
      timeout: options?.timeout ?? 30 * 1000,
    };
  }

  public abstract addEventListener<T extends EventSourceEventType>(
    event: T,
    listener: (e: Extract<EventSourceEvent, { type: T }>) => void
  ): void;

  public abstract removeEventListeners(): void;

  public abstract open(): Promise<void>;

  public abstract close(): void;

  public abstract abort(): void;

  public abstract retry(): void;
}

export type EventSourceEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'timeout';

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
  event: string | null | undefined;
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

export type EventSourceHttpConfig = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, string>;
  timeout?: number;
  debug?: boolean;
};

export type EventSourceStreamOptions = {
  speed?: number;
};
