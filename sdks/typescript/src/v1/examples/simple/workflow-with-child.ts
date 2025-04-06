// ❓ Declaring a Task
import sleep from '@hatchet/util/sleep';
import { hatchet } from '../hatchet-client';

// (optional) Define the input type for the workflow
export type ChildInput = {
  Message: string;
};

export type ParentInput = {
  Message: string;
};

export const child = hatchet.task({
  name: 'child',
  retries: 3,
  fn: async (input: ChildInput, ctx) => {
    // fail 10% of the time
    if (Math.random() < 0.1) {
      throw new Error('Failed to complete task');
    }

    // sleep for a random amount of time between 1 and 10 seconds
    const sleepTime = 1000 * (Math.random() * 40 + 1);
    console.log(`Sleeping for ${sleepTime}ms`);
    await sleep(sleepTime);
    return {
      TransformedMessage: input.Message.toLowerCase(),
    };
  },
});

export const parent = hatchet.task({
  name: 'parent',
  fn: async (input: ParentInput, ctx) => {
    // eslint-disable-next-line no-plusplus

    const children = [];
    for (let i = 0; i < Math.floor(Math.random() * 100) + 10; i++) {
      const c = await ctx.runNoWaitChild(child, {
        Message: input.Message,
      });
      children.push(c);
    }

    const results = await Promise.all(children.map((c) => c.output));

    const jitter = Math.floor(Math.random() * 1000) + 30000;

    await parent.schedule(new Date(Date.now() + jitter), {
      Message: input.Message,
    });

    return {
      TransformedMessage: results.map((r) => r.TransformedMessage).join(', '),
    };
  },
});

// !!

// see ./worker.ts and ./run.ts for how to run the workflow
