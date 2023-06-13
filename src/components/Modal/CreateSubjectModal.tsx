import { firestore } from '@/firebase/clientApp';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Box, Text, Input } from '@chakra-ui/react';
import { doc, getDoc, runTransaction, serverTimestamp, setDoc, Transaction } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useRecoilStoreID } from 'recoil';

type CreateSubjectModalProps = {
    open: boolean;
    handleClose: () => void;
    userId: string;
    };

const CreateSubjectModal:React.FC<CreateSubjectModalProps> = ({ open, handleClose, userId}) => {
    const [name, setName ] = useState('');
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 31) return;
        setName(event.target.value);
      };
   
   const handleCreateSubject = async () => {

    const subjectDocRef = doc(firestore, 'subjects', name);

    await runTransaction(firestore, async (transaction) => {
        const subjectDoc = await transaction.get(subjectDocRef);
        if (subjectDoc.exists()) {
            throw new Error ('Sorry, Subject Group Already Exists')
        }
        transaction.set(subjectDocRef, {
            creatorId: userId,
            createdAt: serverTimestamp(),
            numberOfMembers: 1
        });


        transaction.set(doc(firestore, `users/${userId}/subjectSnippets`, name), {
            subjectId: name,
            isModerator: true,
        })
    })
    handleClose()
   
    setLoading(false);

   }
   
   
   return (
        <>
         
    
          <Modal isOpen={open} onClose={handleClose} >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader display='flex' flexDirection='column' >Create a Subject Group</ModalHeader>
              <Box>
              <ModalCloseButton />
              
              <ModalBody display='flex' flexDirection='column'>
                <Text fontWeight={600} fontSize={15}>
                    Name
                    </Text>
                    <Input name="name"
            value={name} size='sm'  onChange={handleChange} type={""}/>
                    
              </ModalBody>
              </Box>


              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={handleClose}>
                  Close
                </Button>
                <Button variant='ghost' onClick={handleCreateSubject} isLoading={loading}>Create Subject Group</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
)}
export default CreateSubjectModal;