import { notFound } from "next/navigation";
import Link from "next/link";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { blog } from "@/lib/source";
import { ArrowLeft } from "lucide-react";
import Section from "@/components/_ui/section";

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
      <Section.RootElement className="_ui">
        <Section.Container container="7xl" className="">
          <div className="_page-header mt-8 mb-6 pb-4">
            <Link href="/blog" className="">
              <ArrowLeft size={15} /> <span>Back</span>
            </Link>

            <h1 className="_blog-title">{page.data.title}</h1>
            <h5 className="_blog-description">
              {page.data.description}
            </h5>
          </div>

          <article className="_article-body">
            <div className="_mdx-content">
              <InlineTOC items={page.data.toc} />
              <Mdx components={defaultMdxComponents} />
            </div>
          </article>
        </Section.Container>
      </Section.RootElement>
    </>
  );
}

export function generateStaticParams(): { slug: string | undefined }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
