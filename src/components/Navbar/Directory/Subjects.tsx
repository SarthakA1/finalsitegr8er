import { resolveMypIcon } from '@/utils/subjectIcons';
import { curriculumState } from '@/atoms/curriculumAtom';
// ... (in Subjects component)

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

    // Auto-seed DP subjects (Comprehensive Check)
    useEffect(() => {
        const seedSubjects = async () => {
            if (curriculum.curriculumId !== 'ib-dp') return;

            try {
                // We want to ensure ALL subjects in the list exist in DB.
                // Checking one by one is safer for updates.
                const batch = writeBatch(firestore);
                let updateCount = 0;

                for (const sub of dpSubjects) {
                    // This is slightly inefficient (N reads) but safe and runs rarely
                    // Optimization: We could just validte known new ones, but loop is fine for <30 items.
                    const docRef = doc(firestore, 'subjects', sub.id);
                    // Use getDoc to check existence
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        batch.set(docRef, {
                            id: sub.id,
                            creatorId: 'system',
                            numberOfMembers: 0,
                            createdAt: serverTimestamp(),
                            imageURL: sub.imageURL,
                            subjectInfo: sub.name,
                            curriculumId: 'ib-dp'
                        });
                        updateCount++;
                    }
                }

                if (updateCount > 0) {
                    console.log(`Seeding ${updateCount} new DP Subjects...`);
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
                    {mySnippets.filter(snippet => (snippet.curriculumId || 'ib-myp') === 'ib-myp').map(snippet => {
                        const customIcon = resolveMypIcon(snippet.subjectId);
                        return (
                            <MenuListItem key={snippet.subjectId}
                                icon={customIcon.icon}
                                displayText={`${snippet.subjectId}`}
                                link={`/subject/${snippet.subjectId}`}
                                // imageURL={snippet.imageURL} // Removed to force icon usage as requested
                                bgGradient={customIcon.bgGradient}
                                color={customIcon.color}
                            />
                        )
                    })}
                </>
            ) : (
                <>
                    {/* Joined DP Subjects */}
                    {mySnippets.filter(snippet => snippet.curriculumId === 'ib-dp').map(snippet => {
                        const subName = dpSubjects.find(s => s.id === snippet.subjectId)?.name || snippet.subjectId;
                        const customIcon = resolveMypIcon(snippet.subjectId);
                        return (
                            <MenuListItem key={snippet.subjectId}
                                icon={customIcon.icon}
                                displayText={subName}
                                link={`/subject/${snippet.subjectId}`}
                                // imageURL={snippet.imageURL} // Force icon usage
                                bgGradient={customIcon.bgGradient}
                                color={customIcon.color}
                            />
                        )
                    })}

                    {/* Browse DP Subjects */}
                    <Box mt={3} mb={3} >
                        <Text pl={3} mb={1} fontSize="10pt" fontWeight={500} color="gray.500"> BROWSE DP SUBJECTS </Text>
                    </Box>
                    {dpSubjects.filter(sub => !mySnippets.find(s => s.subjectId === sub.id)).map(subject => {
                        const customIcon = resolveMypIcon(subject.id);
                        return (
                            <MenuListItem key={subject.id}
                                icon={customIcon.icon}
                                displayText={subject.name}
                                link={`/subject/${subject.id}`}
                                // imageURL={subject.imageURL} 
                                bgGradient={customIcon.bgGradient}
                                color={customIcon.color}
                            />
                        )
                    })}


                </>
            )}
        </>
    )
}
export default Subjects;