import { ai } from '@/ai/genkit';
import { createApiHandler } from '@genkit-ai/next';

export const { GET, POST } = createApiHandler({
  ai,
  allowCors: true,
  
  // Optional: Add your authentication logic if needed
  // auth: async (authHeader) => {
  //   const user = await verifyToken(authHeader.substring(7));
  //   if (!user) throw new Error('Unauthorized');
  //   return user;
  // }
});
