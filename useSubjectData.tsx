import { Subject, subjectState } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, doc, getDoc, getDocs, increment, WriteBatch, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { SubjectSnippet } from '@/atoms/subjectsAtom';
import { useRouter } from 'next/router';




const useSubjectData = () => {

    const [user] = useAuthState(auth);
    const router = useRouter();

    const [subjectStateValue, setSubjectStateValue] = useRecoilState(subjectState) 

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onJoinOrLeaveSubject = (subject: Subject, isJoined?: boolean) => {
        console.log("ON JOIN LEAVE", subject.id);


        if (isJoined) {
           leaveSubject(subject.id);
           return;
        }
        joinSubject(subject);
    
    }

    
    const getMySnippets = async () => {
        setLoading(true);
        try {
            //getting user snippets
            const snippetDocs = await getDocs(collection(firestore, `users/${user?.uid}/subjectSnippets`))

            const snippets = snippetDocs.docs.map(doc => ({ ...doc.data() }))
            setSubjectStateValue(prev => ({
                ...prev,
                mySnippets: snippets as SubjectSnippet[],
                initSnippetsFetched: true,
            })
                )

        } catch (error: any) {
            console.log("getMySnippetsError", error)
        }
        setLoading(false);
    }

    const joinSubject = async (subject: Subject) => {
        
        try {
            const batch = writeBatch(firestore);
            const newSnippet: SubjectSnippet = {
                subjectId: subject.id,
                imageURL: subject.imageURL || "",
            }

            //creating a new subject snippet for user when joined
            batch.set(doc(firestore, `users/${user?.uid}/subjectSnippets`, subject.id), newSnippet)
            
            //updating the number of members on each subject group (+1)
            batch.update(doc(firestore, 'subjects', subject.id), {
                numberOfMembers: increment(1)
            })

            await batch.commit()
            //update recoil state to update User interface for the user
            setSubjectStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet]
            }))

        } catch (error: any) {
            console.log("joinSubject error", error);
            setError(error.message);
         }
         setLoading(false);

    }

    
    const leaveSubject = async (subjectId: string) => {

         try {
            //deleting community snippet from users
            const batch = writeBatch(firestore);
            batch.delete(doc(firestore, `users/${user?.uid}/subjectSnippets`, subjectId))
            
            //updating the number of members on each subject group (-1)
            batch.update(doc(firestore, 'subjects', subjectId), {
                numberOfMembers: increment(-1)
            })

            await batch.commit()

            //update recoil state to update User interface for the user
            setSubjectStateValue(prev => ({
                ...prev,
                mySnippets: prev.mySnippets.filter((item) => item.subjectId !== subjectId)
            }))

         } catch (error: any) {
            console.log("leaveSubject error", error);
            setError(error.message);
         }
         setLoading(false);
    }

    const getSubjectData = async (subjectId: string) => {
        try {
            const subjectDocRef = doc(firestore, 'subjects', subjectId)
            const subjectDoc = await getDoc(subjectDocRef);
            
            setSubjectStateValue(prev => ({
                ...prev,
                currentSubject: { id: subjectDoc.id, ...subjectDoc.data() } as Subject
            }))

        } catch (error) {
            console.log('getSubjectData', error)
            
        }
    }
    
    useEffect(() => {
        if (!user) {
            setSubjectStateValue((prev) => ({
                ...prev,
                mySnippets: [],
                snippetsFetched: false
            }));
            return;
        }
        getMySnippets()
        }, [user])

    useEffect(() => {
        const { subjectId }= router.query;

        if (subjectId && !subjectStateValue.currentSubject) {
            getSubjectData(subjectId as string);
        }
    }, [router.query, subjectStateValue.currentSubject])

    return {
        subjectStateValue,
        onJoinOrLeaveSubject,
        loading,
    }

   
}
export default useSubjectData;
