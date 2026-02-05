import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useOnline } from "@/hooks/use-online";

export function AuthSignInButton({ charCount }: { charCount?: number }) {
  const isOnline = useOnline();

  const handleEditorEmptyClick = () =>{
    
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button
          className="hover:bg-primary/70 active:scale-[0.95] transition-colors duration-300"
          disabled={!isOnline}
        >
          Sign In
        </Button>
      </SignInButton>
    </>
  );
}
