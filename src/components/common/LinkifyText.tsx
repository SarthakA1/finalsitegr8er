import React from 'react';
import { Text, Link } from '@chakra-ui/react';

interface LinkifyTextProps {
    text: string;
    fontSize?: string;
}

const LinkifyText: React.FC<LinkifyTextProps> = ({ text, fontSize = "10pt" }) => {
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return (
        <Text fontSize={fontSize}>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <Link key={index} href={part} color="blue.500" isExternal onClick={(e) => e.stopPropagation()}>
                            {part}
                        </Link>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </Text>
    );
};

export default LinkifyText;
