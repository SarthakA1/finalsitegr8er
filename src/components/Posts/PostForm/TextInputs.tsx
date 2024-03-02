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
    criteria: { value: string; label: string }[];
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

  // Custom validation function for "Type Of Questions" field
  const validateTypeOfQuestions = () => {
    let error = null;
    if (!textInputs.typeOfQuestions.value) {
      error = "Type Of Questions is required";
    }
    setTypeOfQuestionsError(error);
    if (!error && textInputs.title && textInputs.body) {
      handleCreatePost();
    }
  };

  return (
    <Stack spacing={3} width="100%">
      <SimpleGrid columns={2} spacing={10}>
        <Flex direction="row" style={{ display: "block" }}>
          <Select
            name="grade"
            placeholder="MYP"
            value={textInputs.grade.value}
            onChange={(selectedGradeOptions: any) =>
              handleInputChange("grade", selectedGradeOptions)
            }
            options={gradeOptions}
          />
        </Flex>
        <Flex style={{ display: "block" }}>
          <Select
            isMulti
            name="criteria[]"
            options={criteriaOptions}
            placeholder="Criteria"
            value={textInputs.criteria}
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
            value={textInputs.typeOfQuestions.value}
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
          placeholder="Topic"
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
          disabled={!textInputs.title || !textInputs.body || !textInputs.typeOfQuestions.value}
          isLoading={loading}
          onClick={() => validateTypeOfQuestions()}
        >
          Ask
        </Button>
      </Flex>
    </Stack>
  );
};
export default TextInputs;
