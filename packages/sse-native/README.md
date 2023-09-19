# @wrtn/sse-native

Server sent events handling for react native apps using native libraries

## Peer Deps

Android - [okhttp sse](https://github.com/square/okhttp)

iOS - [swift eventsource](https://github.com/launchdarkly/swift-eventsource)

## Installation

```sh
yarn add @wrtn/sse-native @wrtn/sse-types
```

### iOS

auto link

```sh
cd ios && pod install
```

### Android

add below on `android/app/build.gradle`

```gradle
dependencies {
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:okhttp-sse:4.11.0'
}
```

## Usage

```typescript
import { NativeEventSource } from '@wrtn/sse-native';
import { OpenEvent, MessageEvent, ErrorEvent } from '@wrtn/sse-types';

useEffect(() => {
  const eventSource = new NativeEventSource('http://localhost:3000/stream');

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
