// ❓ Declaring a Worker
import { hatchet } from '../hatchet-client';
import { simple } from './workflow';
import { parent, child, leaf } from './workflow-with-child';

async function main() {
  const worker = await hatchet.worker('simple-worker', {
    // 👀 Declare the workflows that the worker can execute
    workflows: [simple, parent, child, leaf],
    // 👀 Declare the number of concurrent task runs the worker can accept
    slots: 3,
  });

  const stop = worker.start();
  const runs = [];

  try {
    for (let i = 0; i < 1; i++) {
      const run = await parent.runNoWait({ Message: 'Hello, world!' });
      runs.push(run);
    }

    const results = await Promise.all(runs.map((r) => r.output));

    console.log(results);
  } catch (error) {
    console.error(error);
  }

  // worker.stop();
  await stop;
}

if (require.main === module) {
  main();
}
// !!
