import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello! HOOKLOOP!!!');
});

app.listen(8088, () => {
  console.log('Server is running!');
});
