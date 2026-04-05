const BlockRenderer = ({ blocks = [] }) => {
    return (
        <div className="blog-page-content">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case "paragraph":
                        return (
                            <p
                                key={i}
                                className="mb-4"
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        );
                    case "header": {
                        const Tag = `h${block.data.level}`;
                        return (
                            <Tag
                                key={i}
                                className="mb-4"
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        );
                    }
                    case "list":
                        return block.data.style === "ordered" ? (
                            <ol key={i} className="list-decimal pl-6 mb-4">
                                {block.data.items.map((item, j) => (
                                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ol>
                        ) : (
                            <ul key={i} className="list-disc pl-6 mb-4">
                                {block.data.items.map((item, j) => (
                                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ul>
                        );
                    case "code":
                        return (
                            <pre key={i} className="bg-grey p-4 rounded-lg mb-4 overflow-x-auto">
                                <code>{block.data.code}</code>
                            </pre>
                        );
                    case "quote":
                        return (
                            <blockquote
                                key={i}
                                className="border-l-4 border-purple pl-4 italic mb-4"
                            >
                                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                {block.data.caption && (
                                    <cite className="text-sm text-dark-grey">— {block.data.caption}</cite>
                                )}
                            </blockquote>
                        );
                    case "image":
                        return (
                            <figure key={i} className="mb-4">
                                <img src={block.data.file?.url} alt={block.data.caption} className="rounded-xl" />
                                {block.data.caption && (
                                    <figcaption className="text-center text-sm text-dark-grey mt-2">
                                        {block.data.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default BlockRenderer;