import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";
import Link from "@editorjs/link";

const EditorComponent = ({ onChange, initialData }) => {
    const editorRef = useRef(null);
    const holderRef = useRef(null);
//check editor state
    useEffect(() => {
        if (!holderRef.current || editorRef.current) return;
//defined editor
        const editor = new EditorJS({
            holder: holderRef.current,
            tools: {
                header: {
                    class: Header,
                    config: {
                        placeholder: "Enter a heading...",
                        levels: [2, 3],
                        defaultLevel: 2,
                    },
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                    config: { defaultStyle: "unordered" },
                },
                code: {
                    class: Code,
                    config: { placeholder: "Enter code here..." },
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: "Enter a quote",
                        captionPlaceholder: "Quote author",
                    },
                },
                marker: { class: Marker },
                inlineCode: { class: InlineCode },
                embed: {
                    class: Embed,
                    config: {
                        services: {
                            youtube: true,
                            twitter: true,
                            instagram: true,
                            codepen: true,
                        },
                    },
                },
            },
            data: initialData || { blocks: [] },
            placeholder: "Let's write an awesome story!",
            onChange: async () => {
                try {
                    const content = await editor.save();
                    onChange(content);
                } catch (err) {
                    console.error("EditorJS save error:", err);
                }
            },
        });

        editorRef.current = editor;
//clean up func
        return () => {
            if (
                editorRef.current &&
                typeof editorRef.current.destroy === "function"
            ) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id="textEditor"
            ref={holderRef}
            className="min-h-[400px] prose max-w-none"
        />
    );
};

export default EditorComponent;