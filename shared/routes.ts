import { z } from 'zod';
import { pets } from './schema';

export const errorSchemas = {
  notFound: z.object({ message: z.string() })
};

export const api = {
  pets: {
    list: {
      method: 'GET' as const,
      path: '/api/pets' as const,
      responses: {
        200: z.array(z.custom<typeof pets.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
