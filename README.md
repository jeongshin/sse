# @wrtn/sse

monorepo for handling server sent events for react & react native apps

## Packages

- **wrtn**
  - **example**
    - **web**
      - Vite React app for testing `@wrtn/sse-web`
      - [README](example/web/README.md)
    - **app**
      - React Native app for testing `@wrtn/sse-native`
    - **server**
      - Express server for mocking stream
      - [README.md](example/server/README.md)
  - **packages**
    - **sse-native**
      - Native `EventSource` implements
      - [README.md](https://github.com/jeongshin/rn-sse)
    - **sse-types**
      - Shared types
      - [README.md](packages/sse-types/README.md)
    - **sse-web**
      - Web `EventSource` implements
      - [README.md](packages/sse-web/README.md)
