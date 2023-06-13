import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export type Post = {
    id?: string;
    subjectId: string;
    creatorId: string;
    creatorDisplayName: string;
    title: string;
    body: string;
    numberOfAnswers: number;
    voteStatus: number;
    imageURL?: string;
    subjectImageURL?: string;
    createdAt: Timestamp;
    grade: string;
}

export type PostVote = {
    id?: string;
    postId: string;
    subjectId: string;
    voteValue: number;
}
interface PostState {
    selectedPost: Post | null;
    posts: Post []
    postVotes: PostVote[],
    
}

const DefaultPostState: PostState = {
    selectedPost: null,
    posts: [],
    postVotes: [],
}


export const PostState = atom<PostState>({
    key:'PostState',
    default: DefaultPostState
})