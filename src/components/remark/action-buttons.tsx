import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export function AuthSignInButton() {
  return (
    <SignInButton mode="modal">
      <Button className="">Sign In</Button>
    </SignInButton>
  );
}

export function CommentButton() {
  return <Button className="_comment-btn">Comment</Button>;
}
