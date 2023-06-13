import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
    children: React.ReactNode;
};

const PageContentLayout:React.FC<PageContentProps> = ( { children }) => {
    
    return ( 
        <Flex justify='center' p="16px 0px" > 
            <Flex width="95%" justify='center' maxWidth='1200px' >
                {/* {LHS} */}
                <Flex 
               direction='column'
               display={{base: "none", md: "flex"}}
               flexGrow={1}
                >{ children && children [0 as keyof typeof children]}</Flex>
                {/* {RHS} */}
                <Flex 
                 direction='column'
                 width={{base: "100%", md:"75%"}}
                 ml={{ base: 0, md: 6}}
                
                >{ children && children [1 as keyof typeof children]}</Flex>
            </Flex>
        </Flex>
    )
}
export default PageContentLayout;