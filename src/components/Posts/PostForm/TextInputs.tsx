import React, { useState } from 'react';
import {
  Stack,
  Input,
  Textarea,
  Flex,
  Button,
  Text,
  SimpleGrid,
  FormErrorMessage,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  AsyncCreatableSelect,
  AsyncSelect,
  CreatableSelect,
  Select,
  chakraComponents,
} from "chakra-react-select";
import "react-quill/dist/quill.snow.css";
import { Editor } from "../../common/Editor";

type TextInputsProps = {
  textInputs: {
    title: string;
    body: string;
    grade: { value: string; label: string };
    criteria: { value: string; label: string };
    typeOfQuestions: { value: string; label: string };
  };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCriteriaChange: (selectedOptions: any) => void;
  handleCreatePost: () => void;
  loading: boolean;
};

const TextInputs: React.FC<TextInputsProps> = ({
  textInputs,
  onChange,
  onCriteriaChange,
  handleCreatePost,
  loading,
}) => {
  const [typeOfQuestionsError, setTypeOfQuestionsError] = useState<string | null>(
    null
  );
  const [missingFieldsAlert, setMissingFieldsAlert] = useState<string | null>(
    null
  );

  // Custom validation function for "Type Of Questions" field
  const validateTypeOfQuestions = (value: any) => {
    let error = null;
    if (!value.typeOfQuestions) {
      error = "Type Of Questions is required";
    }
    setTypeOfQuestionsError(error);
    if (error == null) {
      handleCreatePost();
    }
  };

  const criteriaOptions = [
    {
      value: "Criteria A",
      label: "Criteria A",
    },
    {
      value: "Criteria B",
      label: "Criteria B",
    },
    {
      value: "Criteria C",
      label: "Criteria C",
    },
    {
      value: "Criteria D",
      label: "Criteria D",
    },
  ];

  const customCriteriaComponents = {
    Option: ({ children, ...props }: any) => (
      <chakraComponents.Option {...props}>{children}</chakraComponents.Option>
    ),
  };

  return (
    <Stack spacing={3} width="100%">
      <SimpleGrid columns={2} spacing={10}>
        <Flex direction="row" style={{ display: "block" }}>
          <Select
            name="grade"
            placeholder="MYP"
            value={textInputs.grade.value && textInputs.grade} // Set the value prop for controlled component
            onChange={(selectedGradeOptions: any) =>
              onChange({
                target: {
                  name: "grade",
                  value: selectedGradeOptions,
                },
              } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
            }
            options={[
              { value: "1", label: "MYP 1" },
              { value: "2", label: "MYP 2" },
              { value: "3", label: "MYP 3" },
              { value: "4", label: "MYP 4" },
              { value: "5", label: "MYP 5" },
            ]}
          />
        </Flex>
        <Flex style={{ display: "block" }}>
          {textInputs.criteria.value && (
            <div>
              <label>Criteria: </label>
              <span>{textInputs.criteria.value}</span>
            </div>
          )}
          <Select
            isMulti
            name="criteria[]"
            options={criteriaOptions}
            placeholder="Criteria"
            value={textInputs.criteria.value && textInputs.criteria} // Set the value prop for controlled component
            onChange={(selectedOptions: any) => {
              onCriteriaChange(selectedOptions);
              onChange({
                target: {
                  name: "criteria",
                  value: selectedOptions,
                },
              } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
            }}
            components={customCriteriaComponents}
          />
        </Flex>
      </SimpleGrid>
      <SimpleGrid columns={2} spacing={10}>
        <Flex style={{ display: "block" }}>
          <Select
            name="typeOfQuestions"
            placeholder="Type Of Question"
            value={textInputs.typeOfQuestions.value && textInputs.typeOfQuestions} // Set the value prop for controlled component
            onChange={(selectedtypeOfQuestionsOptions: any) => {
              onChange({
                target: {
                  name: "typeOfQuestions",
                  value: selectedtypeOfQuestionsOptions,
                },
              } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
              validateTypeOfQuestions(selectedtypeOfQuestionsOptions);
            }}
            options={[
              {
                value: "Academic Question",
                label: "Academic Question",
                tooltip: "Academic questions are those that have a specific answer and usually come from school or test materials like worksheets, exams, or past papers. They often involve solving problems or answering questions with a single correct solution, such as math problems or exam-style questions.",
              },
              {
                value: "General Doubt",
                label: "General Doubt",
                tooltip: "General doubts are open-ended and can cover a wide range of topics. They might include asking for advice, requesting resources, seeking tips or tricks, or any other generic queries you may want an answer to.",
              },
            ]}
          />
          <p
            style={{
              color: "#ff0000",
              fontSize: "12px",
              paddingLeft: "3px",
              paddingTop: "3px",
            }}
          >
            {typeOfQuestionsError}
          </p>
        </Flex>
        <Input
          name="title"
          value={textInputs.title}
          onChange={(e: any) => onChange(e)}
          _placeholder={{ color: "gray.500" }}
          _focus={{
            outline: "none",
            bg: "white",
            border: "1px solid",
            borderColor: "black",
          }}
          fontSize="10pt"
          borderRadius={4}
          placeholder="Title"
        />
      </SimpleGrid>
      <Editor
        id="body"
        name="body"
        value={textInputs.body}
        onChange={(name: any, val: any) => {
          onChange({
            target: {
              name,
              value: val,
            },
          } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
        }}
      />
      <Flex justify="flex-end">
        <Button
          height="34px"
          padding="0px 30px"
          isLoading={loading}
          onClick={() => {
            const missingFields = [];
            if (!textInputs.title) missingFields.push("Title");
            if (!textInputs.grade.value) missingFields.push("MYP");
            if (!textInputs.typeOfQuestions.value) missingFields.push("Type Of Questions");
            
            if (missingFields.length > 0) {
              // Display alert if any required field is missing
              setMissingFieldsAlert(`Please fill in the following fields: ${missingFields.join(", ")}`);
            } else {
              // Proceed with post creation
              handleCreatePost();
            }
          }}
        >
          Ask
        </Button>
      </Flex>
      {missingFieldsAlert && (
        <Alert status="warning">
          <AlertIcon />
          {missingFieldsAlert}
        </Alert>
      )}
    </Stack>
  );
};

export default TextInputs;
