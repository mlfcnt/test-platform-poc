"use client";

import {SignedIn, SignedOut, UserButton, ClerkProvider} from "@clerk/nextjs";
import {ReactNode, Suspense} from "react";

export function ClientSignedIn({children}: {children: ReactNode}) {
  return (
    <Suspense fallback={null}>
      <SignedIn>{children}</SignedIn>
    </Suspense>
  );
}

export function ClientSignedOut({children}: {children: ReactNode}) {
  return (
    <Suspense fallback={null}>
      <SignedOut>{children}</SignedOut>
    </Suspense>
  );
}

export function ClientUserButton() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserButton />
    </Suspense>
  );
}

export function ClientClerkProvider({children}: {children: ReactNode}) {
  // Don't render ClerkProvider during build/prerendering if no publishable key
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClerkProvider>{children}</ClerkProvider>
    </Suspense>
  );
}
