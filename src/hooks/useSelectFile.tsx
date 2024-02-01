import React, { useState } from 'react';


const useSelectFile = () => {
    const [selectedFile, setSelectedFile] = useState<string[]>([])
    const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        console.log(files);
        files.forEach(file => {
          const reader = new FileReader();
      
          reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
              setSelectedFile(prevFiles => [...prevFiles, readerEvent.target?.result as string]);
            }
          };
      
          reader.readAsDataURL(file);
        });
    };
    // const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const reader = new FileReader();

    //     if (event.target.files?.[0]) {
    //         reader.readAsDataURL(event.target.files[0])
    //     }

    //     reader.onload = (readerEvent) => {
    //         if (readerEvent.target?.result) {
    //             setSelectedFile(readerEvent.target.result as string);
    //         }
    //     }
    // }
    return {
        selectedFile, setSelectedFile, onSelectFile
    }
}
export default useSelectFile;