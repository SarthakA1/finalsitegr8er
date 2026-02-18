import { Button, Flex, Input, Stack, Text, useToast } from '@chakra-ui/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import { firestore, storage } from '../../firebase/clientApp';
import PageContent from '@/components/layout/PageContent';

const UploadContent: React.FC = () => {
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !title) return;
        setLoading(true);
        try {
            // 1. Create a reference to the file in storage
            const contentRef = ref(storage, `content_library/${selectedFile.name}`);

            // 2. Upload the file
            await uploadBytes(contentRef, selectedFile);

            // 3. Get the download URL
            const downloadURL = await getDownloadURL(contentRef);

            // 4. Save metadata to Firestore
            await addDoc(collection(firestore, 'content_library'), {
                title,
                url: downloadURL,
                type: 'PDF', // Assuming PDF for now as per request
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Content uploaded successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Reset form
            setTitle('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error: any) {
            console.error('Error uploading content', error);
            toast({
                title: 'Error uploading content.',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        setLoading(false);
    };

    return (
        <PageContent>
            <Flex direction="column" p={5} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                <Text fontSize="lg" fontWeight={700} mb={4}>Upload to Verified Resources</Text>
                <Stack spacing={4}>
                    <Input
                        placeholder="Content Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={onSelectFile}
                    />
                    <Button
                        onClick={handleUpload}
                        isLoading={loading}
                        disabled={!selectedFile || !title}
                        colorScheme="brand"
                    >
                        Upload Content
                    </Button>
                </Stack>
            </Flex>
            <></>
        </PageContent>
    );
};

export default UploadContent;
