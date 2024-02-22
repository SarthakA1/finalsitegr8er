import React, { useState, useMemo } from "react";
import dynamic from 'next/dynamic'
import "react-quill/dist/quill.snow.css";
export const Editor = ({ id, name, value, onChange, onBlur }:any) => {
    const quillRef = React.useRef();
    const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }),[]);
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6] }, { font: [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' },
            ],
            ['link','image','formula'],
            ['clean'],
        ],
        clipboard: {
            matchVisual: false,
        },
    }

    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
    ]
    const handleChange = (val:any, delta:any, source:any, editor:any) => {
        onChange(name, val);
    };

    const handleBlur = () => {
        onBlur(name, true);
    };
    return (
        <>
            <div className="text-editor">
                {/* {CustomToolbar(id)} */}
                <ReactQuill
                    style={{ backgroundColor: "white" }}
                    placeholder="please enter description"
                    theme="snow"
                    value={value}
                    onChange={(e, delta, source, editor) => {
                        handleChange(e, delta, source, editor);
                    }}
                    //onBlur={handleBlur}
                    modules={modules}
                    formats={formats}
                />
            </div>
        </>
    );
};
