"use client";
import Background from "@/components/_ui/background";
import Section from "@/components/_ui/section";
import CommentsSection from "@/components/remark";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <Section.RootElement className="mt-12 overflow-hidden">
      <Section.Container container="7xl" className="p-6 px-8 relative">
        <Background className="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden="true"
            src="/imgs/gradient-2.png"
            alt="gradient-img"
            className="absolute left-1/2 -translate-x-[50%] mask-t-from-40% dark:opacity-20 opacity-30 -z-1 top-[calc(-144/16*1rem)] w-[calc(1463/16*1rem)] max-w-none"
            style={{ color: "transparent" }}
          />
        </Background>

        <div className="_contents">
          <h2 className="text-center font-semibold text-balance max-w-xl max-sm:text-4xl mx-auto">
            Bring Conversations to your Blog, Article...
            <span className="font-serif font-normal italic">anywhere</span>
          </h2>
          <p className="text-muted-foreground text-center  max-w-xl mx-auto">
            A lightweight, customizable, comment-section template that turns
            your readers into participants.{" "}
          </p>

          <div className="_btns flex justify-center gap-2 my-8">
            <Link href="/blog/remark" className="relative">
              <Button
                className={`rounded-full p-4 flex bg-primary/80 hover:bg-primary items-center border-2!   `}
              >
                Remark?
                <ChevronRight className="-mt-0.5" />
              </Button>

              <div
                className="absolute rounded-full backdrop-blur-2xl -z-1 -inset-0.5"
                style={{
                  background:
                    "linear-gradient(180deg,transparent 25%, rgba(108, 71, 255, 0.5) 85%, rgba(93, 227, 255, 0.5) 85%, rgba(93, 227, 255, 1) 95%)",
                }}
              />
            </Link>
            <Link href="/blog/remark-setup">
              <Button variant="ghost" className="rounded-full p-4">
                Getting Started
              </Button>
            </Link>
          </div>
        </div>
      </Section.Container>
    </Section.RootElement>
  );
}

export function CommentsDemo() {
  return (
    <Section.RootElement className="-mt-6 min-h-[60dvh] relative">
      <Section.Container container="7xl" className="p-6 pt-0 px-8">
        <div className="absolute -top-9 text-muted-foreground">
          [Try it out 👇]
        </div>
        <CommentsSection customPostId="home-comments-1" />
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
