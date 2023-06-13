import AuthButtons from '@/components/Navbar/RightContent/AuthButtons';
import { Flex, Textarea, Button, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React from 'react';

type AnswerInputProps = {
    answerText: string;
    setAnswerText: (value: string) => void;
    user: User;
    createLoading: boolean;
    onCreateAnswer: (answerText: string) => void;
};

const AnswerInput:React.FC<AnswerInputProps> = ({ answerText, setAnswerText, user, createLoading, onCreateAnswer}) => {
    
    return (
        <Flex direction="column" position="relative" >
        {user ? (
          <>
            <Text mb={1}>
              Answer as{" "}
              <span style={{ color: "#2c75b9" }}>
              {user?.displayName! || user?.email!.split("@")[0]}
              </span>
            </Text>
            <Textarea
              value={answerText}
              onChange={(event) => setAnswerText(event.target.value)}
              placeholder="What is the Answer to this Question?"
              fontSize="10pt"
              borderRadius={4}
              minHeight="160px"
              pb={10}
              _placeholder={{ color: "gray.500" }}
              _focus={{
                outline: "none",
                border: "1px solid black",
                bg:"white"
                
              }}
            />
            <Flex
              position="absolute"
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
                onClick={() => onCreateAnswer(answerText)}
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
      
        )
        
}
export default AnswerInput;