import { OptionBase } from "chakra-react-select";

export interface CriteriaOptions extends OptionBase {
  label: string;
  value: string;
}

export const criteriaOptions: CriteriaOptions[] = [
    {value: "Criteria A", label: "Criteria A"},
    {value: "Criteria B", label: "Criteria B"},
    {value: "Criteria C", label: "Criteria C"},
    {value: "Criteria D", label: "Criteria D"}
];

export interface TypeOfQuestionsOptions extends OptionBase {
    label: string;
    value: string;
}
  
export const typeOfQuestionsOptions: TypeOfQuestionsOptions[] = [
    {value: "Academic Question", label: "Academic Question"},
    {value: "General Question", label: "General Question"}
];

export interface GradeOptions extends OptionBase {
  label: string;
  value: string;
}

export const gradeOptions: GradeOptions[] = [
  { value: "1", label: "MYP 1" },
  { value: "2", label: "MYP 2" },
  { value: "3", label: "MYP 3" },
  { value: "4", label: "MYP 4" },
  { value: "5", label: "MYP 5" }
];
