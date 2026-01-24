import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useOnline } from "@/hooks/useOnline";

export function AuthSignInButton() {
  const isOnline = useOnline();

  return (
    <SignInButton mode="modal">
      <Button className="cursor-not-allowed" disabled={!isOnline}>
        Sign In
      </Button>
    </SignInButton>
  );
}
