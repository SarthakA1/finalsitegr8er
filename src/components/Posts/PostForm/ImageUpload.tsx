import React from "react";
import { Flex, Button, Image, Stack } from "@chakra-ui/react";

type ImageUploadProps = {
  selectedFile: string[];
  setSelectedFile: (value: string[]) => void;
  setSelectedTab: (value: string) => void;
  selectFileRef: any;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFile,
  setSelectedFile,
  setSelectedTab,
  selectFileRef,
  onSelectImage,
}) => {
  return (
    <Flex direction="column" justify="center" align="center" width="100%">
      <ul style={{ listStyle: 'none', display: 'flex' }}>
        {selectedFile.map((file, index) => {
          const matchResult = file.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);
          let mimeType = '';
          if (matchResult && matchResult.length > 0) {
            mimeType = matchResult[0];
          }

          let fileImage = '';
          if (mimeType === 'application/pdf') {
            fileImage = '/images/pdf.png';
          } else if (mimeType === 'image/png' || mimeType === 'image/jpeg') {
            fileImage = file;
          } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            fileImage = '/images/docs.png'
          }

          return (
            <li key={index} style={{ listStyle: 'none', border: '1px solid #ccc', borderRadius: '10px', margin: "5px" }}>
              <Image
                src={fileImage}
                maxWidth="400px"
                maxHeight="400px"
                style={{ padding: "10px", width: "100%" }}
              />
              <Stack direction="row" mt={4} style={{ textAlign: "center", display: "block" }}>
                <Button
                  variant="outline"
                  height="28px"
                  onClick={() => {
                    const updatedFiles = [...selectedFile];
                    updatedFiles.splice(index, 1);
                    setSelectedFile(updatedFiles);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </li>
          );
        })}
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed"
          borderColor="gray.200"
          borderRadius={4}
          width="100%"
        >
          <Button
            variant="outline"
            height="28px"
            onClick={() => selectFileRef.current?.click()}
          >
            Upload
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/png,image/gif,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            ref={selectFileRef}
            onChange={onSelectImage}
            multiple
          />
        </Flex>
      </ul>
    </Flex>
  );
};
export default ImageUpload;
