import React, { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import WebEventSource from '@wrtn/sse-web';
import { MessageEvent } from '@wrtn/sse-types';
import './App.css';

function App() {
  const [result, setResult] = useState('');

  const [aborted, setAborted] = useState(false);

  const es = useRef<WebEventSource | null>(null);

  useEffect(() => {
    es.current = new WebEventSource('http://localhost:3000/stream', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    es.current.addEventListener('open', console.log);
    es.current.addEventListener('close', console.log);
    es.current.addEventListener('message', (e: MessageEvent) => {
      console.log(e);
      const data = JSON.parse(e.data);
      if ('chunk' in data) {
        setResult((prev) => prev + ` ${data.chunk}`);
      }
    });
    es.current.addEventListener('error', console.log);

    es.current.open();

    return () => {
      es.current?.close();
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <button
        onClick={() => {
          setAborted((prev) => !prev);
          if (!aborted) {
            es.current?.abort();
          } else {
            es.current?.retry();
          }
        }}
      >
        {aborted ? 'start' : 'stop'}
      </button>
      <div className="card">
        <p>{result}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
