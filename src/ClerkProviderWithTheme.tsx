// src/ClerkProviderWithTheme.tsx
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

// Get Clerk publishable key from environment variables
const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key');
}

export const ClerkProviderWithTheme: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        elements: {
          // Primary buttons
          formButtonPrimary: 
            'bg-yellow-600 hover:bg-yellow-700 text-white',
          
          // Card styling for sign-in/sign-up forms
          card: 'bg-white shadow-xl rounded-xl',
          
          // Header text for sign-in/sign-up forms
          headerTitle: 'text-2xl font-bold text-gray-900',
          
          // Social buttons
          socialButtonsIconButton: 
            'border border-gray-300 hover:bg-gray-100',
          
          // Form fields
          formFieldInput: 
            'rounded-md border-gray-300 focus:border-yellow-500 focus:ring-yellow-500',
          
          // Footer actions
          footerActionLink: 
            'text-yellow-600 hover:text-yellow-700',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWithTheme;