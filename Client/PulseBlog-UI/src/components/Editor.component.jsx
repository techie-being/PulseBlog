import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";

const EditorComponent = ({ initialContent, onChange }) => {
    const editorRef     = useRef(null);   
    const holderRef     = useRef(null);   

    useEffect(() => {
        if (!holderRef.current) return;

        const editor = new EditorJS({
            holder: holderRef.current,
            autofocus: true,
            placeholder: "Tell your story...",
            data: initialContent || {},
            tools: {
                header: {
                    class: Header,
                    config: { levels: [2, 3], defaultLevel: 2 },
                },
                list: List,
                code: Code,
                quote: Quote,
                marker: Marker,
                inlineCode: InlineCode,
                embed: Embed,
            },
            onChange: async () => {
                const data = await editor.save();
                onChange(data);
            },
        });

        editorRef.current = editor;

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);   

    return (
        <div
            id="textEditor"
            ref={holderRef}
            className="font-gelasio min-h-[400px]"
        />
    );
};

export default EditorComponent;