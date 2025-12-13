import { curriculumState } from '@/atoms/curriculumAtom';
import { subjectState } from '@/atoms/subjectsAtom';
import CreateSubjectModal from '@/components/Modal/CreateSubjectModal';
import { auth, firestore } from '@/firebase/clientApp';
import { dpSubjects } from '@/lib/curriculumData';
import { Box, Flex, Icon, MenuItem, MenuList, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserCircle } from 'react-icons/fa';
import { GrAdd } from 'react-icons/gr';
import { IoIosCreate } from 'react-icons/io';
import { RiGroup2Fill } from 'react-icons/ri';
import { useRecoilState, useRecoilValue } from 'recoil';
import MenuListItem from './MenuListItem';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

type subjectsProps = {

};

const Subjects: React.FC<subjectsProps> = () => {
    const [open, setOpen] = useState(false);
    const mySnippets = useRecoilValue(subjectState).mySnippets;
    const curriculum = useRecoilValue(curriculumState);
    const [user] = useAuthState(auth);

    // Auto-seed DP subjects if they don't exist
    useEffect(() => {
        const seedSubjects = async () => {
            if (curriculum.curriculumId !== 'ib-dp') return;

            try {
                // Check if the first DP subject exists
                const firstSub = dpSubjects[0];
                const docRef = doc(firestore, 'subjects', firstSub.id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    console.log("Seeding DP Subjects...");
                    const batch = writeBatch(firestore);
                    dpSubjects.forEach(sub => {
                        const newDocRef = doc(firestore, 'subjects', sub.id);
                        batch.set(newDocRef, {
                            id: sub.id,
                            creatorId: 'system', // or a dedicated admin ID
                            numberOfMembers: 0,
                            createdAt: serverTimestamp(),
                            imageURL: sub.imageURL,
                            subjectInfo: sub.name,
                            curriculumId: 'ib-dp'
                        });
                    });
                    await batch.commit();
                    console.log("Seeding complete.");
                }
            } catch (error) {
                console.error("Error seeding DP subjects", error);
            }
        };
        seedSubjects();
    }, [curriculum.curriculumId]);

    return (
        <>
            <CreateSubjectModal open={open} handleClose={() => setOpen(false)} userId={user?.uid!} />
            <Box mt={3} mb={3} >
                <Text pl={3} mb={1} fontSize="10pt" fontWeight={500} color="gray.500"> MY SUBJECT GROUPS </Text>
            </Box>

            {curriculum.curriculumId === 'ib-myp' ? (
                <>
                    {mySnippets.filter(snippet => (snippet.curriculumId || 'ib-myp') === 'ib-myp').map(snippet => (
                        <MenuListItem key={snippet.subjectId}
                            icon={RiGroup2Fill}
                            displayText={`${snippet.subjectId}`}
                            link={`/subject/${snippet.subjectId}`} iconColor="blue.500" imageURL={snippet.imageURL} />
                    ))}
                </>
            ) : (
                <>
                    {/* Joined DP Subjects */}
                    {mySnippets.filter(snippet => snippet.curriculumId === 'ib-dp').map(snippet => (
                        <MenuListItem key={snippet.subjectId}
                            icon={RiGroup2Fill}
                            displayText={snippet.subjectId}
                            link={`/subject/${snippet.subjectId}`}
                            iconColor="purple.500"
                            imageURL={snippet.imageURL} />
                    ))}

                    {/* Browse DP Subjects */}
                    <Box mt={3} mb={3} >
                        <Text pl={3} mb={1} fontSize="10pt" fontWeight={500} color="gray.500"> BROWSE DP SUBJECTS </Text>
                    </Box>
                    {dpSubjects.filter(sub => !mySnippets.find(s => s.subjectId === sub.id)).map(subject => (
                        <MenuListItem key={subject.id}
                            icon={RiGroup2Fill}
                            displayText={subject.name}
                            link={`/subject/${subject.id}`}
                            iconColor="purple.500"
                            imageURL={subject.imageURL} />
                    ))}
                </>
            )}


        </>
    )
}
export default Subjects;