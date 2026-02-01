import Link from "next/link";
import { blog } from "@/lib/source";

export default function Home() {
  const posts = blog.getPages();
  const sortedBlogs = posts.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="_blog-list-page relative -mt-18 pb-18">
      <div className="_header pt-18 mb-2 pb-10 bg-linear-to-b from-neutral-100 dark:from-neutral-800 to-transparent">
        <div className="container-7xl px-6 py-12">
          <h1 className="mt-8 mb-3 text-4xl font-bold">Latest Blog Posts</h1>
          <p className="text-muted-foreground mb-12 sm:max-w-xl">
            Updates, news and project tracking will be detailed in posts here.
            Check back regularly to stay up-to-date with progress and
            announcements.
          </p>
        </div>
      </div>

      <div className="container-7xl min-h-[67vh] max-md:min-h-[72vh] -mt-10 px-6">
        <div className="_card-list grid gap-4 md:grid-cols-2 max-md:gap-y-8 lg:grid-cols-3">
          {sortedBlogs.map((post) => (
            <Link
              key={post.url}
              href={post.url}
              className="_card bg-secondary/40 hover:bg-secondary/70 ring-accent dark:ring-accent/30 flex flex-col justify-between overflow-hidden rounded-xl border p-6 ring-3 transition-colors duration-300"
            >
              <div className="_card-header">
                <h5 className="_card-title mb-2 opacity-85">
                  {post.data.title}
                </h5>
                <p className="text-muted-foreground mb-auto text-[0.9rem]">
                  {post.data.description}
                </p>
              </div>
              <div className="_card-footer mt-8 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="_avatar size-6 rounded-full bg-linear-to-bl from-neutral-400 to-sky-100 opacity-90" />
                  <p className="_author text-muted-foreground text-[0.9rem]">
                    {post.data.author}
                  </p>
                </div>
                <div className="_date text-muted-foreground opacity-90">
                  <p className="text-[0.85rem]">{`${post.data.date.toLocaleString().split(",")[0]}`}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
