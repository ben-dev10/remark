import Section from "@/components/_ui/section";
import { IconGitHub, IconLinkedin } from "@/components/_ui/social-icons";
import Link from "next/link";
import { GITHUB_LINK, LINKEDIN_LINK, NARD_SITE } from "./constants";

export default function Footer() {
  return (
    <Section.RootElement className="_footer ">
      <Section.Container
        container="7xl"
        className="p-6 flex justify-between text-muted-foreground"
      >
        <p className="">
          A project by{" "}
          <Link href={NARD_SITE} className="underline">
            @nard
          </Link>
        </p>
        <div className="flex gap-3">
          <IconGitHub url={GITHUB_LINK} />
          <IconLinkedin u1={LINKEDIN_LINK} />
        </div>
      </Section.Container>
    </Section.RootElement>
  );
}
