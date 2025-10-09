import { ai } from '@/ai/genkit';
import { createApiHandler } from '@genkit-ai/next';

export const { GET, POST } = createApiHandler({
  ai,
  // This is necessary if you are running Genkit in a different environment
  // from your web app.
  allowCors: true,

  // An example of how to use authentication.
  // auth: async (authHeader) => {
  //   const user = await verifyToken(authHeader.substring(7));
  //   if (!user) throw new Error('Unauthorized'); // Use native Error for simplicity
  //   return user;
  // }
});
