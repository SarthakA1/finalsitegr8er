import React, { useState } from "react";
import { Stack, Input, Textarea, Flex, Button, Select, Text} from "@chakra-ui/react";


type TextInputsProps = {
  textInputs: {
    title: string;
    body: string;
    grade: string;
  };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCreatePost: () => void;
  loading: boolean;
};



const TextInputs: React.FC<TextInputsProps> = ({
  textInputs,
  onChange,
  handleCreatePost,
  loading,
}) => {
  function setData(value: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Stack spacing={3} width="100%">
      <Text ml={0.5} mt={2} fontWeight={500}>
      MYP (Move the Slider to select your Grade!)
      </Text>
      <Flex direction='row'>
        
      <Input
        name="grade"
        value={textInputs.grade}
        onChange={onChange}
        _placeholder={{ color: "gray.500" }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "black",
        }}
        fontSize="10pt"
        borderRadius={4}
        placeholder="MYP (Move the Slider to select your grade!)"
        required
        type="range" id="slider"
         min="1" max="5" step="1" defaultValue="3"
         />
         <Text ml={4} mt={2}  mr={1} fontWeight={600} color="#2c75b9"> {textInputs.grade} </Text>

      
      </Flex>
     
      <Input
        name="title"
        value={textInputs.title}
        onChange={onChange}
        _placeholder={{ color: "gray.500" }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "black",
        }}
        fontSize="10pt"
        borderRadius={4}
        placeholder="Topic"
      />
      <Textarea
        name="body"
        value={textInputs.body}
        onChange={onChange}
        fontSize="10pt"
        placeholder="Question"
        _placeholder={{ color: "gray.500" }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "black",
        }}
        height="400px"
      />
      <Flex justify="flex-end">
       
        <Button
          height="34px"
          padding="0px 30px"
          disabled={!textInputs.title || !textInputs.body}
          isLoading={loading}
          onClick={handleCreatePost}
        >
          Ask
        </Button>
        
      </Flex>
    </Stack>
  );
};
export default TextInputs;