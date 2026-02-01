import { notFound } from "next/navigation";
import Link from "next/link";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { blog } from "@/lib/source";
import { ArrowLeft } from "lucide-react";
import Section from "@/components/_ui/section";
import CommentsSection from "@/components/remark";
import Background from "@/components/_ui/background";
import { getMDXComponents } from "@/mdx-components";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  const Mdx = page.data.body;

  return (
    <>
      <Section.RootElement>
        <Section.Container
          container="none"
          className="-mt-18 bg-linear-to-b from-neutral-100 dark:from-neutral-800 to-transparent"
        >
          <Background className="">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-1 flex justify-center overflow-hidden mix-blend-color-burn dark:mix-blend-soft-light dark:opacity-40">
              <div
                className="h-217.5 w-full flex-none"
                style={{
                  background:
                    "radial-gradient(68.19% 45.43% at 49.34% 30.94%, rgba(108, 71, 255, 0.5) 11.86%, rgba(56, 211, 253, 0.4) 57.19%, rgba(98, 72, 246, 0) 83.77%)",
                }}
              ></div>
            </div>
          </Background>

          <div className="_page-header relative z-2 container-7xl p-6 pt-32 mb-6 pb-5">
            <Link
              href="/blog"
              className="flex gap-1 items-center rounded-full hover:bg-secondary max-w-max p-1 px-1.5 pr-2"
            >
              <ArrowLeft size={14} className="text-muted-foreground" />{" "}
              <span>Back</span>
            </Link>

            <h1 className="_blog-title">{page.data.title}</h1>
            <h5 className="_blog-description text-muted-foreground">
              {page.data.description}
            </h5>
          </div>
        </Section.Container>

        <Section.Container container="7xl" className="relative z-2">
          <article className="_article-body p-6">
            <div className="_mdx-content prose dark:prose-invert prose-headings:scroll-mt-22 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-balance prose-code:text-[0.90rem] prose-p:tracking-tight prose-p:leading-[1.8rem]! prose-lg max-w-none pb-30">
              <InlineTOC items={page.data.toc} className="mb-8" />
              <Mdx components={getMDXComponents()} />
            </div>
          </article>
        </Section.Container>

        <div className="p-6 mt-15 border-t">
          <div className="container-7xl pt-10">
            <CommentsSection
              title="Join the discussion."
              description="Feel free to engage and share ideas, but remember to be kind and respectful to one another."
            />
          </div>
        </div>
      </Section.RootElement>
    </>
  );
}

export function generateStaticParams(): { slug: string | undefined }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
