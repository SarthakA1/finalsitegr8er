import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export type Answer = {
    id?: string;
    postId: string;
    postTitle: string;
    subjectId: string;
    creatorId?: string;
    creatorDisplayText?: string;
    text: string;
    voteStatus: number;
    createdAt: Timestamp;
}

export type AnswerVote = {
    id: string;
    postId: string;
    answerId: string;
    subjectId: string;
    voteValue: number;
}
interface AnswerState {
    selectedPost: Answer | null;
    answers: Answer []
    answerVotes: AnswerVote[],
    
}

const DefaultAnswerState: AnswerState = {
    selectedPost: null,
    answers: [],
    answerVotes: [],
}


export const AnswerState = atom<AnswerState>({
    key:'AnswerState',
    default: DefaultAnswerState
})