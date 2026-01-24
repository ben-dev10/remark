"use client";
import Section from "@/components/_ui/section";
import { ThemeToggle } from "@/components/_ui/theme-toggles";
import CommentsSection from "@/components/remark";

export default function Home() {
  return (
    <>
      <div className="_navbar border-b mb-8">
        <div className="container-7xl flex justify-between p-2 px-8">
          <div className="">
            <h4 className="font-bold"> Remark</h4>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <Section.RootElement>
        <Section.Container container="7xl" className="p-6 px-8">
          <CommentsSection />
        </Section.Container>
      </Section.RootElement>
    </>
  );
}
