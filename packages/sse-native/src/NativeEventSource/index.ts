import type { EmitterSubscription, NativeModule } from 'react-native';

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import type {
  EventCallback,
  EventSourceEvent,
  EventSourceEventType,
  EventSourceHttpOptions,
  EventSourceStreamOptions,
} from '../types';

interface NativeEventSourceModule extends NativeModule {
  connect(url: string, options: EventSourceHttpOptions): void;
  disconnect(): void;
}

const nativeEvents: EventSourceEventType[] = [
  'open',
  'message',
  'error',
  'close',
];

class EventSource {
  private nativeEventSource =
    requireNativeModule<NativeEventSourceModule>('EventSource');

  private eventEmitter = new NativeEventEmitter(
    Platform.select({
      ios: requireNativeModule('RNEventEmitter'),
      default: undefined,
    })
  );

  private debug: boolean;

  private listeners: Record<EventSourceEventType, EventCallback[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
    suspend: [],
    timeout: [],
  };

  constructor(
    url: string,
    {
      headers = {},
      body = {},
      method = 'GET',
      timeout = 30 * 1000,
      debug = false,
    }: EventSourceHttpOptions = {},
    {}: EventSourceStreamOptions = {}
  ) {
    this.debug = debug;

    this.nativeEventSource.connect(url, {
      headers,
      body,
      method,
      timeout,
      debug,
    });

    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.addListener(nativeEvent, (event) => {
        this.listeners[nativeEvent].forEach((listener) => {
          listener(event);
        });
      });
    });

    this.log(`connected to ${url}`);
  }

  private log(...args: any) {
    if (this.debug) {
      console.log(`[react-native-event-source]`, ...args);
    }
  }

  public addEventListener<E extends EventSourceEventType>(
    event: E,
    listener: (e: Extract<EventSourceEvent, { type: E }>) => void
  ): EmitterSubscription {
    return this.eventEmitter.addListener(event, listener);
  }

  public removeEventListeners<E extends EventSourceEventType>(event: E): void {
    this.eventEmitter.removeAllListeners(event);
  }

  public removeAllEventListeners(): void {
    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.removeAllListeners(nativeEvent);
    });
  }

  public close(): void {
    this.removeAllEventListeners();
    this.nativeEventSource.disconnect();
  }
}

const LINKING_ERROR =
  `The package 'react-native-event-source' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

function requireNativeModule<T>(
  moduleName: 'EventSource' | 'RNEventEmitter'
): T {
  return NativeModules[moduleName]
    ? NativeModules[moduleName]
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
}

export default EventSource;
