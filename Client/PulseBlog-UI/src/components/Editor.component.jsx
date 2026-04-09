import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";

const EditorComponent = ({ onChange }) => {
    const editorRef     = useRef(null);   
    const holderRef     = useRef(null);   
    const isReady       = useRef(false);  

    useEffect(() => {
        if (isReady.current) return;
        if (!holderRef.current) return;
        isReady.current = true;

        editorRef.current = new EditorJS({
            holder: holderRef.current,
            autofocus: true,
            placeholder: "Tell your story...",
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
                const data = await editorRef.current.save();
                onChange(data);
            },
        });

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
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