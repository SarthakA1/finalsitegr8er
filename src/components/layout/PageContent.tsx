import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
    children: React.ReactNode;
};

const PageContentLayout: React.FC<PageContentProps> = ({ children }) => {

    return (
        <Flex justify='center' py="16px" px={{ base: 4, md: 8 }}>
            <Flex width="100%" justify='center' maxWidth='1600px'  >
                {/* {LHS - Main Content} */}
                <Flex
                    direction='column'
                    width={{ base: "100%", md: "75%" }}
                    mr={{ base: 0, md: 6 }}
                >{children && children[0 as keyof typeof children]}</Flex>
                {/* {RHS - Sidebar} */}
                <Flex
                    direction='column'
                    display={{ base: "none", md: "flex" }}
                    width={{ base: "100%", md: "25%" }}
                    flexGrow={1}
                >{children && children[1 as keyof typeof children]}</Flex>
            </Flex>
        </Flex>
    )
}
export default PageContentLayout;