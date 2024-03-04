import React, { useState } from "react";
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
  const handleInputChange = (name: any, value: any) => {
    onChange({
      target: {
        name,
        value, // Assuming criteria is a comma-separated string
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };
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
  const typeOfQuestionsOptions = [
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
  ];
  const gradeOptions = [
    {
      value: "1",
      label: "MYP 1",
    },
    {
      value: "2",
      label: "MYP 2",
    },
    {
      value: "3",
      label: "MYP 3",
    },
    {
      value: "4",
      label: "MYP 4",
    },
    {
      value: "5",
      label: "MYP 5",
    },
  ];
  const customCriteriaComponents = {
    Option: ({ children, ...props }: any) => (
      <chakraComponents.Option {...props}>{children}</chakraComponents.Option>
    ),
  };
  const customTypeOfQuestionsComponents = {
    Option: ({ children, ...props }: any) => (
      <chakraComponents.Option {...props}>
        <Flex alignItems="center">
          <Text>{children}</Text>
          {props.data.tooltip && (
            <Tooltip label={props.data.tooltip}>
              <Icon as={InfoOutlineIcon} color="gray.500" ml={2} />
            </Tooltip>
          )}
        </Flex>
      </chakraComponents.Option>
    ),
  };
  const customGradeComponents = {
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
            components={customGradeComponents}
            value={textInputs.grade.value && textInputs.grade} // Set the value prop for controlled component
            onChange={(selectedGradeOptions: any) =>
              handleInputChange("grade", selectedGradeOptions)
            }
            options={gradeOptions}
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
            components={customCriteriaComponents}
            value={textInputs.criteria.value && textInputs.criteria} // Set the value prop for controlled component
            onChange={(selectedOptions: any) =>
              handleInputChange("criteria", selectedOptions)
            }
          />
        </Flex>
      </SimpleGrid>
      <SimpleGrid columns={2} spacing={10}>
        <Flex style={{ display: "block" }}>
          <Select
            name="typeOfQuestions"
            placeholder="Type Of Question"
            components={customTypeOfQuestionsComponents}
            value={textInputs.typeOfQuestions.value && textInputs.typeOfQuestions} // Set the value prop for controlled component
            onChange={(selectedtypeOfQuestionsOptions: any) =>
              handleInputChange("typeOfQuestions", selectedtypeOfQuestionsOptions)
            }
            options={typeOfQuestionsOptions}
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
          onChange={(e: any) => handleInputChange("title", e.target.value)}
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
          handleInputChange(name, val);
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
              // Display alert if any required field is missing, including placeholder text
              const missingFieldsWithPlaceholders = missingFields.map(field => {
                if (field === "Title") return `"${field}" (${textInputs.title})`;
                if (field === "MYP") return `"${field}" (${textInputs.grade.label})`;
                if (field === "Type Of Questions") return `"${field}" (${textInputs.typeOfQuestions.label})`;
              });
              setMissingFieldsAlert(`Please fill in the following fields: ${missingFieldsWithPlaceholders.join(", ")}`);
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
