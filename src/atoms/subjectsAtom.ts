import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";


export interface Subject {
    id: string;
    creatorId: string;
    numberOfMembers: number;
    createdAt: Timestamp;
    imageURL?: string; 
    subjectInfo: string;
}

export interface SubjectSnippet {
    subjectId: string;
    isModerator?: boolean;
    imageURL: string;

}

interface SubjectState {
    mySnippets: SubjectSnippet[],
    currentSubject?: Subject;
    snippetsFetched: boolean;
}

const defaultSubjectState: SubjectState = {
    mySnippets: [],
    snippetsFetched: false,
}

export const subjectState = atom<SubjectState> ({
    key: 'subjectsState',
    default: defaultSubjectState,

})