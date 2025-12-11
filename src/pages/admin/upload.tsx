
import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Textarea,
    NumberInput,
    NumberInputField,
    Stack,
    Text,
    useToast,
    VStack,
    Image,
    Icon
} from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, storage, firestore } from '@/firebase/clientApp';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiUploadCloud, FiFile, FiImage } from 'react-icons/fi';

const AdminUploadPage = () => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(5.00);

    // File State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [contentFile, setContentFile] = useState<File | null>(null);

    const toast = useToast();
    const thumbnailRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLInputElement>(null);

    // Helpers
    const onSelectThumbnail = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                if (readerEvent.target?.result) {
                    setThumbnailPreview(readerEvent.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const onSelectContent = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setContentFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!title || !price || !thumbnailFile || !contentFile) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill all fields and select files.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Thumbnail
            const thumbnailStorageRef = ref(storage, `content_thumbnails/${Date.now()}_${thumbnailFile.name}`);
            await uploadBytes(thumbnailStorageRef, thumbnailFile);
            const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);

            // 2. Upload Content
            const contentStorageRef = ref(storage, `content_files/${Date.now()}_${contentFile.name}`);
            await uploadBytes(contentStorageRef, contentFile);
            const contentUrl = await getDownloadURL(contentStorageRef);

            // 3. Save to Firestore
            await addDoc(collection(firestore, 'content_library'), {
                title,
                description,
                price: parseFloat(price.toString()), // Ensure number
                thumbnail: thumbnailUrl,
                url: contentUrl,
                type: contentFile.type.includes('image') ? 'image' : 'pdf', // Simple type check
                createdAt: serverTimestamp(),
                creatorId: user?.uid || 'anon',
            });

            toast({
                title: 'Success!',
                description: 'Content uploaded successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Reset Form (Optional)
            setTitle('');
            setDescription('');
            setPrice(5.00);
            setThumbnailFile(null);
            setThumbnailPreview('');
            setContentFile(null);

        } catch (error: any) {
            console.error('Upload error', error);
            toast({
                title: 'Upload Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        setLoading(false);
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch" bg="white" p={8} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor="gray.100">
                <Heading size="lg" textAlign="center">Upload Content to Library</Heading>

                <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. IB Math AA HL Study Guide" />
                </FormControl>

                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of the resource..." />
                </FormControl>

                <FormControl>
                    <FormLabel>Price (USD)</FormLabel>
                    <NumberInput
                        value={price}
                        onChange={(valueString) => setPrice(parseFloat(valueString))}
                        precision={2}
                        min={0}
                    >
                        <NumberInputField />
                    </NumberInput>
                </FormControl>

                {/* Thumbnail Upload */}
                <FormControl>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <Flex direction="column" align="center" justify="center" p={4} border="2px dashed" borderColor="gray.300" borderRadius="md" cursor="pointer" onClick={() => thumbnailRef.current?.click()}>
                        {thumbnailPreview ? (
                            <Image src={thumbnailPreview} alt="Thumbnail Preview" maxH="200px" objectFit="cover" borderRadius="md" />
                        ) : (
                            <VStack color="gray.500">
                                <Icon as={FiImage} fontSize="3xl" />
                                <Text>Click to upload thumbnail</Text>
                            </VStack>
                        )}
                        <Input type="file" ref={thumbnailRef} hidden onChange={onSelectThumbnail} accept="image/*" />
                    </Flex>
                </FormControl>

                {/* Content File Upload */}
                <FormControl>
                    <FormLabel>Content File (PDF, etc.)</FormLabel>
                    <Flex align="center" gap={4} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <Button leftIcon={<Icon as={FiUploadCloud} />} onClick={() => contentRef.current?.click()} size="sm">
                            Select File
                        </Button>
                        <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {contentFile ? contentFile.name : 'No file selected'}
                        </Text>
                        <Input type="file" ref={contentRef} hidden onChange={onSelectContent} />
                    </Flex>
                </FormControl>

                <Button colorScheme="purple" size="lg" onClick={handleUpload} isLoading={loading} leftIcon={<Icon as={FiUploadCloud} />}>
                    Upload Content
                </Button>

            </VStack>
        </Container>
    );
};

export default AdminUploadPage;
