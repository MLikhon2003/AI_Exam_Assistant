import { app } from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.port, () => {
  console.log(`AI Exam Assistant API running on http://localhost:${env.port}`);
});
