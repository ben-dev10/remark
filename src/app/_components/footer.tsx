import Section from "@/components/_ui/section";
import {
  IconGitHub,
  IconLinkedin,
  IconXTwitter,
} from "@/components/_ui/social-icons";
import Link from "next/link";
import {
  GITHUB_LINK,
  LINKEDIN_LINK,
  NARD_SITE,
  XTWITTER_LINK,
} from "./constants";

export default function Footer() {
  return (
    <Section.RootElement className="_footer mt-12">
      <Section.Container
        container="7xl"
        className="p-6 flex justify-between text-muted-foreground"
      >
        <p className="">
          Built by{" "}
          <Link href={NARD_SITE} className="underline">
            @nard
          </Link>
        </p>
        <div className="flex gap-4">
          <IconGitHub url={GITHUB_LINK} />
          <IconLinkedin url={LINKEDIN_LINK} />
          <IconXTwitter url={XTWITTER_LINK} />
        </div>
      </Section.Container>
    </Section.RootElement>
  );
}
