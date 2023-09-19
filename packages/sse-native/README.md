# @wrtn/sse-native

Server sent events handling for react native apps using native libraries

Android - [okhttp sse](https://github.com/square/okhttp)

iOS - [swift eventsource](https://github.com/launchdarkly/swift-eventsource)

## WIP 🏗️

- [ ] Testing
- [ ] Android
- [ ] iOS

### Android

add below on `android/app/build.gradle`

```gradle
dependencies {
    // ...etc
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:okhttp-sse:4.11.0'
}
```

## Usage

```js
useEffect(() => {
  const eventSource = new EventSource('http://localhost:3000/stream');

  eventSource.addEventListener('open', (e: OpenEvent) => {
    console.log(e);
  });

  eventSource.addEventListener('message', (e: MessageEvent) => {
    const data = JSON.parse(e.data);

    if ('chunk' in data && data.chunk) {
      setResult((p) => p + data.chunk);
    }
  });

  eventSource.addEventListener('error', (e: ErrorEvent) => {
    console.log(e);
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
}, []);
```

## Syntax

```ts
new EventSource(url);
new EventSource(url, options);
new EventSource(url, options, streamOptions);
```

### Parameters

`url`

A string that represents the location of the remote resource serving the events/messages.

`options`

Provides options to configure the new connection.

```ts
export type EventSourceHttpOptions = {
  method?: 'GET' | 'POST'; // default: 'GET'
  headers?: Record<string, string>; // custom headers
  body?: Record<string, string>; // only "POST" request
  timeout?: number; // default: 30 secs
  debug?: boolean; // default: false
};
```

### Event Types

```ts
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
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
