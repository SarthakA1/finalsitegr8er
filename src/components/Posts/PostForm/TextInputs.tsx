import React, { useState } from "react";
import {
  Stack,
  Input,
  Flex,
  Button,
  Text,
  SimpleGrid,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Select, chakraComponents } from "chakra-react-select";
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
  const handleInputChange = (name: any, value: any) => {
    onChange({
      target: {
        name,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  const [gradeError, setGradeError] = useState<string | null>(null);
  const [typeOfQuestionsError, setTypeOfQuestionsError] = useState<string | null>(
    null
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  const validateGrade = (value: any) => {
    let error = null;
    if (!value.grade || !value.grade.value) {
      error = "MYP Grade is required";
    }
    setGradeError(error);
  };

  const validateTypeOfQuestions = (value: any) => {
    let error = null;
    if (!value.typeOfQuestions || !value.typeOfQuestions.value) {
      error = "Type Of Questions is required";
    }
    setTypeOfQuestionsError(error);
  };

  const validateTitle = (value: string) => {
    let error = null;
    if (!value.trim()) {
      error = "Title is required";
    }
    setTitleError(error);
  };

  return (
    <Stack spacing={3} width="100%">
      <SimpleGrid columns={2} spacing={10}>
        <Flex direction="row" style={{ display: "block" }}>
          <Select
            name="grade"
            placeholder="MYP"
            value={textInputs.grade.value && textInputs.grade}
            onChange={(selectedGradeOptions: any) => {
              handleInputChange("grade", selectedGradeOptions);
              validateGrade({ grade: selectedGradeOptions });
            }}
            options={[
              { value: "1", label: "MYP 1" },
              { value: "2", label: "MYP 2" },
              { value: "3", label: "MYP 3" },
              { value: "4", label: "MYP 4" },
              { value: "5", label: "MYP 5" },
            ]}
          />
          <p style={{ color: "#ff0000", fontSize: "12px", paddingLeft: "3px", paddingTop: "3px" }}>
            {gradeError}
          </p>
        </Flex>
        <Flex style={{ display: "block" }}>
          <Select
            name="typeOfQuestions"
            placeholder="Type Of Question"
            value={textInputs.typeOfQuestions.value && textInputs.typeOfQuestions}
            onChange={(selectedtypeOfQuestionsOptions: any) => {
              handleInputChange("typeOfQuestions", selectedtypeOfQuestionsOptions);
              validateTypeOfQuestions({ typeOfQuestions: selectedtypeOfQuestionsOptions });
            }}
            options={[
              { value: "Academic Question", label: "Academic Question" },
              { value: "General Doubt", label: "General Doubt" },
            ]}
          />
          <p style={{ color: "#ff0000", fontSize: "12px", paddingLeft: "3px", paddingTop: "3px" }}>
            {typeOfQuestionsError}
          </p>
        </Flex>
      </SimpleGrid>
      <SimpleGrid columns={2} spacing={10}>
        <Input
          name="title"
          value={textInputs.title}
          onChange={(e: any) => {
            handleInputChange("title", e.target.value);
            validateTitle(e.target.value);
          }}
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
        <p style={{ color: "#ff0000", fontSize: "12px", paddingLeft: "3px", paddingTop: "3px" }}>
          {titleError}
        </p>
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
          disabled={!textInputs.title || !textInputs.body || !textInputs.typeOfQuestions || !textInputs.typeOfQuestions.value || !textInputs.grade || !textInputs.grade.value}
          isLoading={loading}
          onClick={() => {
            validateGrade(textInputs);
            validateTypeOfQuestions(textInputs);
            validateTitle(textInputs.title);
            if (!gradeError && !typeOfQuestionsError && !titleError) {
              handleCreatePost();
            } else {
              alert("Please fill in all mandatory fields.");
            }
          }}
        >
          Ask
        </Button>
      </Flex>
    </Stack>
  );
};

export default TextInputs;
