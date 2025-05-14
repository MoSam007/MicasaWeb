import { clerkClient } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, metadata } = req.body;

    if (!userId || !metadata) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Update the user's public metadata in Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: metadata
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return res.status(500).json({ error: 'Failed to update user metadata' });
  }
}