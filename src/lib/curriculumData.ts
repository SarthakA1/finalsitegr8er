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
    // Group 1: Studies in Language and Literature
    { id: "ib-dp-english-a-lit", name: "English A: Literature", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-english-a-lang-lit", name: "English A: Lang & Lit", imageURL: "", curriculumId: "ib-dp" },

    // Group 2: Language Acquisition
    { id: "ib-dp-french-b", name: "French B", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-spanish-b", name: "Spanish B", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-german-b", name: "German B", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-mandarin-b", name: "Mandarin B", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-spanish-ab", name: "Spanish ab initio", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-french-ab", name: "French ab initio", imageURL: "", curriculumId: "ib-dp" },

    // Group 3: Individuals and Societies
    { id: "ib-dp-business", name: "Business Management", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-economics", name: "Economics", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-history", name: "History", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-geography", name: "Geography", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-psychology", name: "Psychology", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-glopol", name: "Global Politics", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-ess", name: "Env. Systems & Societies", imageURL: "", curriculumId: "ib-dp" },

    // Group 4: Sciences
    { id: "ib-dp-biology", name: "Biology", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-chemistry", name: "Chemistry", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-physics", name: "Physics", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-compsci", name: "Computer Science", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-design-tech", name: "Design Technology", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-sports-sci", name: "Sports, Exercise & Health", imageURL: "", curriculumId: "ib-dp" },

    // Group 5: Mathematics
    { id: "ib-dp-math-aa", name: "Mathematics AA", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-math-ai", name: "Mathematics AI", imageURL: "", curriculumId: "ib-dp" },

    // Group 6: The Arts
    { id: "ib-dp-visual-arts", name: "Visual Arts", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-music", name: "Music", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-film", name: "Film", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-theatre", name: "Theatre", imageURL: "", curriculumId: "ib-dp" },

    // Core
    { id: "ib-dp-tok", name: "Theory of Knowledge (TOK)", imageURL: "", curriculumId: "ib-dp" },
    { id: "ib-dp-ee", name: "Extended Essay (EE)", imageURL: "", curriculumId: "ib-dp" },
];
