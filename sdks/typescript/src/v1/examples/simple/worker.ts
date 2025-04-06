// ❓ Declaring a Worker
import { hatchet } from '../hatchet-client';
import { simple } from './workflow';
import { parent, child } from './workflow-with-child';

async function main() {
  const worker = await hatchet.worker('simple-worker', {
    // 👀 Declare the workflows that the worker can execute
    workflows: [simple, parent, child],
    // 👀 Declare the number of concurrent task runs the worker can accept
    slots: 100,
  });

  const stop = worker.start();
  const runs = [];

  for (let i = 0; i < 2; i++) {
    const run = await parent.runNoWait({ Message: 'Hello, world!' });
    runs.push(run);
  }

  const results = await Promise.all(runs.map((r) => r.output));

  console.log(results);

  // worker.stop();
  await stop;
}

if (require.main === module) {
  main();
}
// !!
