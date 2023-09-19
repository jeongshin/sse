import type { NativeModule } from 'react-native';

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import type {
  EventSourceEventType,
  EventSourceHttpConfig,
} from '@wrtn-test/sse-types';
import { IEventSource } from '@wrtn-test/sse-types';

interface NativeEventSourceModule extends NativeModule {
  connect(url: string, config: EventSourceHttpConfig): void;
  disconnect(): void;
}

const nativeEvents: EventSourceEventType[] = [
  'open',
  'message',
  'error',
  'close',
];

class EventSource extends IEventSource {
  private nativeEventSource =
    requireNativeModule<NativeEventSourceModule>('EventSource');

  private eventEmitter = new NativeEventEmitter(
    Platform.select({
      ios: requireNativeModule('RNEventEmitter'),
      default: undefined,
    })
  );

  constructor(url: string, options?: EventSourceHttpConfig) {
    super(url, options);

    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.addListener(nativeEvent, (event) => {
        this.listeners[nativeEvent].forEach((listener) => {
          listener(event);
        });
      });
    });
  }

  public async open(): Promise<void> {
    this.nativeEventSource.connect(this.url, this.config);
  }

  public removeEventListeners(): void {
    nativeEvents.forEach((nativeEvent) => {
      this.eventEmitter.removeAllListeners(nativeEvent);
    });

    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: [],
      timeout: [],
    };
  }

  public close(): void {
    // this.removeAllEventListeners();
    this.nativeEventSource.disconnect();
  }

  public abort(): void {
    //
  }

  public retry(): void {
    //
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
