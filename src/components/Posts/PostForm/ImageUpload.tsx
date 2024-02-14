import React, { Ref } from "react";
import { Flex, Stack, Button, Image } from "@chakra-ui/react";

type ImageUploadProps = {
  selectedFile: string[];
  setSelectedFile: (value: string[]) => void;
  setSelectedTab: (value: string) => void;
  selectFileRef: React.RefObject<HTMLInputElement>;
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
      {selectedFile.length > 0 
        ?
          selectedFile?.map(file => {
            const matchResult = file.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);
            let mimeType;

            if (matchResult && matchResult.length > 0) {
                mimeType = matchResult[0];
            } else {
                // Handle case when no match is found
                // You may assign a default mimeType or throw an error
            }
            //let mimeType = file.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
            let fileImage = '';
            if(mimeType === 'application/pdf'){
              fileImage = '/images/pdf.png';
            } else if (mimeType === 'image/png' || mimeType === 'image/jpeg'){
              fileImage = file;
            } else if(mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
              fileImage = '/images/docs.png'
            }
            return(
              <>
                <Image
                  src={fileImage}
                  maxWidth="400px"
                  maxHeight="400px"
                />
                <Stack direction="row" mt={4}>
                  <Button
                    variant="outline"
                    height="28px"
                    onClick={() => setSelectedFile([])}
                  >
                    Remove
                  </Button>
                </Stack>
              </>
            )
          })
        :
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
              accept="image/png,image/gif,image/jpeg, application/pdf,application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              ref={selectFileRef}
              onChange={onSelectImage}
              multiple
            />
          </Flex>
      }
    </Flex>
  );
};
export default ImageUpload;