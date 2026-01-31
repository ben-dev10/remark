export default function RemarkDefinition() {
  return (
    <div className="_remark-definition mb-20">
      <h2 className="font-serif mb-1">remark</h2>
      <p>
        <span>
          <i>Noun</i>
        </span>{" "}
        • <span> /ri&apos;maːk/</span>{" "}
        {/* <span>BrE/ri&apos;maːrk/</span>{" "} */}
      </p>
      <div className="border-y my-3">
        <ol>
          <li>
            <span className="text-muted-foreground">[countable]</span> something
            that you say or write to which expresses an opinion, a thought, etc.
            about somebody or something
          </li>
          <div className="ml-10 text-[0.9rem]">
            <span>SYNONYM</span>{" "}
            <span className="text-blue-500 dark:text-blue-300">COMMENT</span>
          </div>
          <ul className="ml-12 text-[0.9rem]">
            <li>to make a remark</li>
            <li>He made his opening remarks to the assembled press</li>
          </ul>
          <li>
            <span className="text-muted-foreground">
              [uncountable] (<i>old fashioned or formal</i>)
            </span>{" "}
            the quality of being important or interesting enough to be noticed
          </li>
        </ol>
      </div>
    </div>
  );
}
