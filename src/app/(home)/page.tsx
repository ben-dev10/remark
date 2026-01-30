"use client";
import Section from "@/components/_ui/section";
import CommentsSection from "@/components/remark";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <Section.RootElement className="mt-12">
      <Section.Container container="7xl" className="p-6 px-8">
        <h2 className="text-center text-balance max-w-xl max-sm:text-4xl mx-auto">
          Beautifully Designed{" "}
          <span className="font-serif font-normal italic">Comments</span> for
          blogs, articles .etc
        </h2>

        <p className="text-muted-foreground"></p>

        <div className="_btns flex justify-center gap-2 my-5">
          <Link href="/blog/remark">
            <Button className="rounded-full">What is Remark?</Button>
          </Link>

          <Link href="/blog/remark-setup">
            <Button variant="secondary" className="rounded-full">
              Getting Started
            </Button>
          </Link>
        </div>
      </Section.Container>
    </Section.RootElement>
  );
}

export function CommentsDemo() {
  return (
    <Section.RootElement>
      <Section.Container container="7xl" className="p-6 px-8">
        <CommentsSection customPostId="test-post-1" />
      </Section.Container>
    </Section.RootElement>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <CommentsDemo />
      <div className="mt-30" />
    </>
  );
}
