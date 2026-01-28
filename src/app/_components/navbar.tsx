import Section from "@/components/_ui/section";
import { ThemeToggle } from "@/components/_ui/theme-toggles";
import RemarkLogo from "@/icons/remark-logo";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const css = `transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow,background] 
  duration-[450ms] ease-[cubic-bezier(0.33,1,0.68,1)] hover:duration-200 pointer-events-auto h-fit items-center rounded-xl bg-[rgba(248,248,248,0.9)] 
  [box-shadow:0_0_0_0.5px_rgba(255,255,255,0.9)_inset,0_0_0_0.5px_rgba(19,19,22,0.15),0_2px_3px_0_rgba(0,0,0,0.04),0_4px_6px_0_rgba(34,42,53,0.04),0_1px_1px_0_rgba(0,0,0,0.05)] 
  dark:bg-[rgba(19,19,22,0.90)] dark:[box-shadow:0_0_0_0.5px_rgba(247,247,248,0.15)_inset,0_0_0_0.5px_rgba(19,19,22,0.8),0_2px_3px_0_rgba(0,0,0,0.16),0_4px_6px_0_rgba(34,42,53,0.16),0_1px_1px_0_rgba(0,0,0,0.16)] 
    `;
  return (
    <Section.RootElement className="_navbar p-2">
      <Section.Container
        container="7xl"
        className={`border ${css} rounded-lg p-2 pr-3`}
      >
        <div className="flex justify-between">
          <div className="_logo flex gap-0.5 items-center">
            <RemarkLogo className="-mb-2 size-7" />
            <p className="font-bold text-[1.2rem]"> Remark</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </Section.Container>
    </Section.RootElement>
  );
}
