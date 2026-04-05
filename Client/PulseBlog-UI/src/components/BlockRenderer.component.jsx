const BlockRenderer = ({ blocks }) => {
    if (!blocks?.length) return null;

    return (
        <div className="blog-page-content">
            {blocks.map((block, i) => {
                //switch case used for rendering different data types
                switch (block.type) {

                    case "paragraph":
                        return (
                            <p
                                key={i}
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        );

                    case "header": {
                        const Tag = `h${block.data.level}`;
                        return (
                            <Tag
                                key={i}
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        );
                    }

                    case "list": {
                        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
                        return (
                            <ListTag
                                key={i}
                                className={block.data.style === "ordered" ? "list-decimal ml-6" : "list-disc ml-6"}
                            >
                                {block.data.items.map((item, j) => (
                                    <li
                                        key={j}
                                        dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                ))}
                            </ListTag>
                        );
                    }

                    case "code":
                        return (
                            <pre
                                key={i}
                                className="bg-grey p-6 rounded-xl overflow-x-auto my-4"
                            >
                                <code className="text-sm">{block.data.code}</code>
                            </pre>
                        );

                    case "quote":
                        return (
                            <blockquote
                                key={i}
                                className="border-l-4 border-purple pl-6 my-4 italic"
                            >
                                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                {block.data.caption && (
                                    <cite className="text-dark-grey text-sm not-italic">
                                        — {block.data.caption}
                                    </cite>
                                )}
                            </blockquote>
                        );

                    case "image":
                        return (
                            <figure key={i} className="my-6">
                                <img
                                    src={block.data.file?.url || block.data.url}
                                    alt={block.data.caption || ""}
                                    className="w-full rounded-2xl"
                                />
                                {block.data.caption && (
                                    <figcaption className="text-center text-dark-grey text-sm mt-2">
                                        {block.data.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case "embed":
                        return (
                            <div key={i} className="my-6 aspect-video rounded-2xl overflow-hidden">
                                <iframe
                                    src={block.data.embed}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={block.data.caption || "embed"}
                                />
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default BlockRenderer;