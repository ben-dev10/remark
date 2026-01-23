"use client";
import Section from "@/components/_ui/section";
import { ThemeToggle } from "@/components/_ui/theme-toggles";
import CommentsWithAuth from "@/components/remark";

export default function Home() {
  return (
    <Section.RootElement>
      <Section.Container container="8xl" className="p-6 px-8">
        <ThemeToggle />
        <CommentsWithAuth />
      </Section.Container>
    </Section.RootElement>
  );
}
