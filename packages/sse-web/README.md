# @wrtn/sse-web

Server sent events handling for react web app

## Peer Deps

[@microsoft/fetch-event-source](https://github.com/Azure/fetch-event-source)

## Installation

```sh
yarn add @wrtn/sse-web @wrtn/sse-types @microsoft/fetch-event-source
```

## Usage

```typescript
import { WebEventSource } from '@wrtn/sse-web';
import { OpenEvent, MessageEvent, ErrorEvent } from '@wrtn/sse-types';

useEffect(() => {
  const eventSource = new WebEventSource('http://localhost:3000/stream');

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

## Checklist ✅

- [x] dispatch HTTP error
- [x] error data stream
- [x] background streaming
- [x] abort control
- [ ] retry from server
- [ ] timeout error
