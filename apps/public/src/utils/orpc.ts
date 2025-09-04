import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { apiRouter } from '../../../server/src/orpc/index';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const link = new RPCLink({
  url: `${import.meta.env.PUBLIC_BACKEND_SERVER_URL!}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  },
});

export const client: RouterClient<typeof apiRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
