import { atom } from "recoil";

export interface CurriculumState {
    curriculumId: "ib-myp" | "ib-dp";
}

const defaultCurriculumState: CurriculumState = {
    curriculumId: "ib-myp",
};

export const curriculumState = atom<CurriculumState>({
    key: "curriculumState",
    default: defaultCurriculumState,
});
