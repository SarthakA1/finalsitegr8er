import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export type AnswerReply = {
    id?: string;
    postId: string;
    postTitle: string;
    answerId: string;
    subjectId: string;
    creatorId: string;
    parentReplyId: string;
    creatorDisplayText: string;
    text: string;
    voteStatus: number;
    createdAt: Timestamp;
}

export type AnswerReplyVote = {
    id: string;
    postId: string;
    answerId: string;
    subjectId: string;
    voteValue: number;
}
interface AnswerReplyState {
    selectedPost: AnswerReply | null;
    answersReply: AnswerReply []
    answerReplyVotes: AnswerReplyVote[],
    
}

const DefaultAnswerReplyState: AnswerReplyState = {
    selectedPost: null,
    answersReply: [],
    answerReplyVotes: [],
}


export const AnswerReplyState = atom<AnswerReplyState>({
    key:'AnswerReplyState',
    default: DefaultAnswerReplyState
})