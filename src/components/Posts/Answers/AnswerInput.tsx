import AuthButtons from '@/components/Navbar/RightContent/AuthButtons';
import { Flex, Button, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { Editor } from '../../common/Editor'; // Import the Editor component

type AnswerInputProps = {
    answerText: string;
    setAnswerText: (value: string) => void;
    user: User;
    createLoading: boolean;
    onCreateAnswer: (answerText: string) => void;
};

const AnswerInput: React.FC<AnswerInputProps> = ({ answerText, setAnswerText, user, createLoading, onCreateAnswer}) => {
    const [editorText, setEditorText] = useState<string>(''); // Initialize editorText with an empty string

    useEffect(() => {
        // Synchronize answerText with editorText when answerText changes
        setEditorText(answerText || ''); // Ensure answerText is not undefined
    }, [answerText]);

    // Function to handle editor content change
    const handleEditorChange = (content: string) => {
        setEditorText(content);
        setAnswerText(content); // Synchronize editor content with answerText state
    };
    
    return (
        <Flex direction="column" position="relative">
            {user ? (
                <>
                    <Text mb={1}>
                        Answer as{" "}
                        <span style={{ color: "#2c75b9" }}>
                            {user?.displayName! || user?.email!.split("@")[0]}
                        </span>
                    </Text>
                    
                    {/* Replace Textarea with Editor */}
                    <Editor
                        value={editorText}
                        onChange={handleEditorChange}
                        placeholder="What is the Answer to this Question?"
                    />
                    
                    <Flex
                        left="1px"
                        right={0.1}
                        bottom="1px"
                        justify="flex-end"
                        bg="gray.100"
                        p="6px 8px"
                        borderRadius="0px 0px 4px 4px"
                    >
                        <Button 
                            height="26px"
                            disabled={!editorText || !editorText.trim().length} // Check if editorText is empty or contains only whitespace
                            isLoading={createLoading}
                            onClick={() => onCreateAnswer(editorText)}
                        >
                            Answer
                        </Button>
                    </Flex>
                </>
            ) : (
                <Flex
                    align="center"
                    justify="space-between"
                    borderRadius={2}
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                >
                    <Text fontWeight={600}>Log in or Sign Up to Answer this Question</Text>
                    <Flex align="center">
                        <AuthButtons />
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
};

export default AnswerInput;
