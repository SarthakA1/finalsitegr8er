import React, { useState } from "react";
import { Stack, Input, Textarea, Flex, Button, Text, SimpleGrid, FormErrorMessage} from "@chakra-ui/react";
import {
  AsyncCreatableSelect,
  AsyncSelect,
  CreatableSelect,
  Select,
  chakraComponents 
} from "chakra-react-select";

type TextInputsProps = {
  textInputs: {
    title: string;
    body: string;
    grade: {value: string, label: string};
    criteria: {value: string, label: string};
    typeOfQuestions: {value: string, label: string};
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
  const handleInputChange = (name:any, value:any) => {
    onChange({
      target: {
        name,
        value // Assuming criteria is a comma-separated string
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };
  const [typeOfQuestionsError, setTypeOfQuestionsError] = useState<string | null>(null);

  // Custom validation function for "Type Of Questions" field
  const validateTypeOfQuestions = (value: any) => {

    let error = null;
    if (!value.typeOfQuestions) {
      error = "Type Of Questions is required";
    }
    setTypeOfQuestionsError(error);
    if(error == null){
      handleCreatePost();
    }
  };
  
  const criteriaOptions = [
    {
      value: "Criteria A",
      label: "Criteria A"
    },
    {
      value: "Criteria B",
      label: "Criteria B"
    },
    {
      value: "Criteria C",
      label: "Criteria C"
    },
    {
      value: "Criteria D",
      label: "Criteria D"
    },
  ];
  const typeOfQuestionsOptions = [
    {
      value: "Academic Question",
      label: "Academic Question"
    },
    {
      value: "General Question",
      label: "General Question"
    },
  ];
  const gradeOptions = [
    {
      value: "1",
      label: "Grade 1"
    },
    {
      value: "2",
      label: "Grade 2"
    },
    {
      value: "3",
      label: "Grade 3"
    },
    {
      value: "4",
      label: "Grade 4"
    },
    {
      value: "5",
      label: "Grade 5"
    },
  ];
  const customCriteriaComponents = {
    Option: ({ children, ...props }:any) => (
      <chakraComponents.Option {...props}>
        {children}
      </chakraComponents.Option>
    ),
  };
  const customTypeOfQuestionsComponents = {
    Option: ({ children, ...props }:any) => (
      <chakraComponents.Option {...props}>
        {children}
      </chakraComponents.Option>
    ),
  }
  const customGradeComponents = {
    Option: ({ children, ...props }:any) => (
      <chakraComponents.Option {...props}>
        {children}
      </chakraComponents.Option>
    ),
  }
  return (
    <Stack spacing={3} width="100%">
      <Text style={{ marginLeft: 0.5, marginTop: 2, fontWeight: 500 }}>
      MYP (Move the Slider to select your Grade!)
      </Text>
      <SimpleGrid columns={2} spacing={10}>
        <Flex direction='row' style={{display: "block"}}>
          <Select
            name="grade"
            placeholder="Grade"
            components={customGradeComponents}
            value={textInputs.grade} // Set the value prop for controlled component
            onChange={(selectedGradeOptions:any) => handleInputChange("grade", selectedGradeOptions)}
            options={gradeOptions}
          />
        {/* <Input
          name="grade"
          value={textInputs.grade}
          onChange={(e) => handleInputChange('grade', e.target.value)}
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
          <Text style={{ marginLeft: 4, marginTop: 2, marginRight: 1, fontWeight: 600,  color: "#2c75b9"}}> {textInputs.grade} </Text> */}
        </Flex>
        <Flex style={{display: "block"}}>
          <Select
            isMulti
            name="criteria"
            options={criteriaOptions}
            placeholder="Criteria"
            components={customCriteriaComponents}
            value={textInputs.criteria} // Set the value prop for controlled component
            onChange={(selectedOptions:any) => handleInputChange("criteria", selectedOptions)}
          />
        </Flex>
      </SimpleGrid>
      <SimpleGrid columns={2} spacing={10}>
        <Flex style={{display: "block"}}>
          <Select
            name="typeOfQuestions"
            placeholder="Type Of Questions"
            components={customTypeOfQuestionsComponents}
            value={textInputs.typeOfQuestions} // Set the value prop for controlled component
            onChange={(selectedtypeOfQuestionsOptions:any) => handleInputChange("typeOfQuestions", selectedtypeOfQuestionsOptions)}
            options={typeOfQuestionsOptions}
          />
          <p style={{color: "#ff0000", fontSize: "12px", paddingLeft: "3px", paddingTop: "3px"}}>{typeOfQuestionsError}</p>
        </Flex>
        <Input
          name="title"
          value={textInputs.title}
          onChange={(e:any) => handleInputChange('title', e.target.value)}
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
      </SimpleGrid>
      <Textarea
        name="body"
        value={textInputs.body}
        onChange={(e:any) => handleInputChange('body', e.target.value)}
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
          //onClick={handleCreatePost}
          onClick={() => validateTypeOfQuestions(textInputs)}
        >
          Ask
        </Button>
        
      </Flex>
    </Stack>
  );
};
export default TextInputs;