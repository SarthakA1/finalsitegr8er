import AuthButtons from '@/components/Navbar/RightContent/AuthButtons';
import { Flex, Textarea, Button, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React, { useState } from 'react';

type AnswerReplyInputProps = {
    answerText: string;
    setAnswerText: (value: string) => void;
    user: User;
    createLoading: boolean;
    onCreateAnswerReply: (answerText: string) => void;
};

const AnswerReplyInput: React.FC<AnswerReplyInputProps> = ({ answerText, setAnswerText, user, createLoading, onCreateAnswerReply }) => {
    const [inputClosed, setInputClosed] = useState(false);

    const handleCreateAnswerReply = (text: string) => {
        onCreateAnswerReply(text);
        setInputClosed(true); // Close the input
    };

    if (inputClosed) {
        return null; // Return null if input is closed
    }

    return (
        <Flex direction="column" position="relative" className='sub-reply-input'>
            {user ? (
                <>
                    <Textarea
                        value={answerText}
                        onChange={(event) => setAnswerText(event.target.value)}
                        placeholder="What would you like to reply?"
                        fontSize="10pt"
                        borderRadius={4}
                        minHeight="160px"
                        pb={10}
                        _placeholder={{ color: "gray.500" }}
                        _focus={{
                            outline: "none",
                            border: "1px solid black",
                            bg: "white"
                        }}
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
                            disabled={!answerText.length}
                            isLoading={createLoading}
                            onClick={() => handleCreateAnswerReply(answerText)}
                        >
                            Reply
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

export default AnswerReplyInput;
