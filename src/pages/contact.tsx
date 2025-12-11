import React, { useState } from 'react';
import { Box, Flex, Text, Heading, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast } from '@chakra-ui/react';
import Head from 'next/head';

const ContactPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Message Sent",
                description: "We've received your message and will get back to you soon.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }, 1000);
    };

    return (
        <Box minH="100vh" py={10} px={{ base: 4, md: 10 }} bg="gray.50">
            <Head>
                <title>Contact Us | Gr8er</title>
            </Head>

            <Flex direction="column" maxWidth="800px" mx="auto" bg="white" p={8} borderRadius="lg" boxShadow="sm">
                <Heading as="h1" size="xl" mb={6} textAlign="center">
                    Contact Us
                </Heading>

                <Text mb={8} textAlign="center" color="gray.600">
                    Have questions? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                </Text>

                <VStack as="form" spacing={5} onSubmit={handleSubmit}>
                    <FormControl id="name" isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input placeholder="Your Name" />
                    </FormControl>

                    <FormControl id="email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" placeholder="your@email.com" />
                    </FormControl>

                    <FormControl id="message" isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea placeholder="How can we help?" rows={6} />
                    </FormControl>

                    <Button type="submit" colorScheme="purple" size="lg" width="full" isLoading={loading}>
                        Send Message
                    </Button>
                </VStack>
            </Flex>
        </Box>
    );
};

export default ContactPage;
