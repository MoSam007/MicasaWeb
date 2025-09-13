import { createClerkClient } from '@clerk/clerk-sdk-node';

// Initialize Clerk with your secret key
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function handler(req: { method: string; body: { userId: any; metadata: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; success?: boolean; }): any; new(): any; }; }; }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, metadata } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Update the user's metadata in Clerk
    await clerk.users.updateUser(userId, {
      publicMetadata: metadata,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return res.status(500).json({ error: 'Failed to update user metadata' });
  }
}