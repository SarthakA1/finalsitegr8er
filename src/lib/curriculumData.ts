import { OptionBase } from "chakra-react-select";

export interface LevelOptions extends OptionBase {
    label: string;
    value: string;
}

export const levelOptions: LevelOptions[] = [
    { value: "HL", label: "Higher Level (HL)" },
    { value: "SL", label: "Standard Level (SL)" }
];

export interface PaperOptions extends OptionBase {
    label: string;
    value: string;
}

export const paperOptions: PaperOptions[] = [
    { value: "1", label: "Paper 1" },
    { value: "2", label: "Paper 2" },
    { value: "3", label: "Paper 3" }
];

export const dpSubjects = [
    { id: "ib-dp-math-aa", name: "Mathematics AA", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-math-ai", name: "Mathematics AI", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-physics", name: "Physics", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-chemistry", name: "Chemistry", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-biology", name: "Biology", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-economics", name: "Economics", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-english-a", name: "English A", imageURL: "", curriculumId: "ib-dp" },
];
