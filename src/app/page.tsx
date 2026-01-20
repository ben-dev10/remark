"use client"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user } = useUser();
  
  return (
    <div className="p-8">
      {isSignedIn ? (
        <div>
          <p>Welcome, {user.firstName}!</p>
          <UserButton />
        </div>
      ) : (
        <div className="space-x-4">
          <SignInButton mode="modal">
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      )}
    </div>
  );
}