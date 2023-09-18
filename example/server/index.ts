import bodyParser from 'body-parser';
import express from 'express';
import { concatMap, delay, from, of } from 'rxjs';
import cors from 'cors';

const app = express();

app.listen(3000, () => {
  console.log('start listening');
});

app.use(bodyParser.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

const messages =
  '이제 더이상 ChatGPT의 딱딱하고 한국어가 서투른 서비스를 이용하려고 애쓰지 않아도 됩니다. ChatGPT를 사용하시는 분들에게 최적화되고 발전하고 있는 한국형 AI 뤼튼을 사용해 보시길 권합니다.  진짜 AI는 미치도록 미쳤다 아무래도 회사 집 회사 집 하시는 분들은 AI? 그냥 요즘 애들 이야기 들어보니까 챗지피틴가 피티인가 하는 뭐시기가 요즘 좋다며?하면서 이야기를 하지만 직접 사용해보고 ai에 대해서 조금 더 들어가면  현재도 AI를 어떻게 활용하느냐에 따라서 앞으로 우리가 발전해야 할 시장이나 세상이 달라질 수도 있을 것 같다는 그런 생각이 드는데요 [출처] 뤼튼테크놀로지를 사용 안하고 있다면 인생을 낭비하고 있는 중이다|작성자 부자가될대학생리치원'.split(
    ' '
  );

const headers = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
};

app.get('/stream', (req, res) => {
  res.writeHead(201, headers);

  console.log('request body from client', req.body, req.headers);

  from(messages)
    .pipe(concatMap((x) => of(x).pipe(delay(500))))
    .subscribe((message) => {
      res.write(
        `id: ${new Date().getTime()}\ndata: ${JSON.stringify({
          chunk: message,
        })}\n\n`
      );

      if (messages.findIndex((x) => x === message) === messages.length - 1) {
        res.write(`data: ${JSON.stringify({ end: '[DONE]' })}\n\n`);
      }
    });

  req.on('close', () => {
    console.log('closed connection from client 💥');
  });
});

app.post('/stream', (req, res) => {
  res.writeHead(201, headers);

  console.log('request body from client', req.body, req.headers);

  from(messages)
    .pipe(concatMap((x) => of(x).pipe(delay(500))))
    .subscribe((message) => {
      res.write(
        `id: ${new Date().getTime()}\ndata: ${JSON.stringify({
          chunk: message,
        })}\n\n`
      );

      if (messages.findIndex((x) => x === message) === messages.length - 1) {
        res.write(`data: ${JSON.stringify({ end: '[DONE]' })}\n\n`);
      }
    });

  req.on('close', () => {
    console.log('closed connection from client 💥');
  });
});

app.get('/stream/timeout', () => {
  // DO NOTHING
});

app.post('*', function (req, res) {
  res.status(404).json({ message: 'error' });
  req.on('close', () => {
    console.log('closed connection from client');
  });
});

app.get('*', function (req, res) {
  res.status(404).json({ message: 'error' });
  req.on('close', () => {
    console.log('closed connection from client');
  });
});

// TODO: mock error case
// app.get('/stream/error', (req, res) => {
//   res.writeHead(201, headers);

//   from(messages)
//     .pipe(concatMap((x) => of(x).pipe(delay(500))))
//     .subscribe((message) => {

//     });

//   req.on('close', () => {
//     console.log('closed connection from client');
//   });
// });

export default app;
