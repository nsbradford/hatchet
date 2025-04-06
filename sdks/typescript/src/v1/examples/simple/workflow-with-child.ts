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

export const leaf = hatchet.task({
  name: 'leaf',
  retries: 3,
  fn: async (input: ChildInput, ctx) => {
    // fail 10% of the time
    // if (Math.random() < 0.1) {
    //   throw new Error('Failed to complete task');
    // }

    // sleep for a random amount of time between 1 and 10 seconds
    const sleepTime = 1000 * (Math.random() * 5 + 1);
    console.log(`leaf sleeping for ${sleepTime}ms`);
    await sleep(sleepTime);
    return {
      TransformedMessage: input.Message.toLowerCase(),
    };
  },
});

export const child = hatchet.task({
  name: 'child',
  retries: 3,
  fn: async (input: ChildInput, ctx) => {
    // // fail 10% of the time
    // if (Math.random() < 0.1) {
    //   throw new Error('Failed to complete task');
    // }

    console.log('Running child LEAF');

    await ctx.runChild(leaf, {
      Message: input.Message,
    });

    // sleep for a random amount of time between 1 and 10 seconds
    const sleepTime = 1000 * (Math.random() * 5 + 1);
    console.log(`child sleeping for ${sleepTime}ms`);
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

    // // fail 10% of the time
    // if (Math.random() < 0.1) {
    //   throw new Error('Parent task failed randomly');
    // }

    await ctx.bulkRunChildren([
      {
        workflow: child,
        input: {
          Message: input.Message,
        },
      },
      {
        workflow: child,
        input: {
          Message: input.Message,
        },
      },
      {
        workflow: child,
        input: {
          Message: input.Message,
        },
      },
    ]);

    // const jitter = Math.floor(Math.random() * 1000) + 30000;

    // await parent.schedule(new Date(Date.now() + jitter), {
    //   Message: input.Message,
    // });

    return {
      TransformedMessage: input.Message.toLowerCase(),
    };
  },
});

// !!

// see ./worker.ts and ./run.ts for how to run the workflow
