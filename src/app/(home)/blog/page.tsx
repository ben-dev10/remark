import Link from "next/link";
import { blog } from "@/lib/source";

export default function Home() {
  const posts = blog.getPages();

  return (
    <div className="">
      {posts.map((post) => (
        <Link key={post.url} href={post.url} className="">
          <h5 className="">{post.data.title}</h5>
          <p className="">{post.data.description}</p>
          <div className="">
            <p className="_author">{post.data.author}</p>
            <div className="_date ">
              <p className="text-[0.85rem]">{`${
                post.data.date.toLocaleString().split(",")[0]
              }`}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
