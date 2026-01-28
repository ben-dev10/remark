"use client";
import Section from "@/components/_ui/section";
import CommentsSection from "@/components/remark";
import Navbar from "./_components/navbar";

export function Hero() {
  return (
    <Section.RootElement className="mt-8">
      <Section.Container container="7xl" className="p-6 px-8">
        <h2 className="text-center text-balance max-w-xl max-sm:text-4xl mx-auto">
          Beautifully Designed{" "}
          <span className="font-serif font-normal italic">Comments</span> for
          blogs, articles .etc
        </h2>
      </Section.Container>
    </Section.RootElement>
  );
}

export function CommentsDemo() {
  return (
    <Section.RootElement>
      <Section.Container container="7xl" className="p-6 px-8">
        <CommentsSection />
      </Section.Container>
    </Section.RootElement>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CommentsDemo />
      <div className="mt-30" />
    </>
  );
}
