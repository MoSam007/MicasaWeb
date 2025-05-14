import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { getToken } = getAuth(req);

  try {
    // Get session token from Clerk
    const token = await getToken();
    
    if (!token) {
      return res.status(401).send('No authentication token available');
    }
    
    // Return the token
    return res.status(200).send(token);
  } catch (error) {
    console.error('Error getting token:', error);
    return res.status(500).send('Failed to get authentication token');
  }
}