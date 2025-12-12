import React from "react";
import { Flex, Icon } from "@chakra-ui/react";
import { BsBell, BsInstagram, BsYoutube } from "react-icons/bs";

const Icons: React.FC = () => {
    return (
        <Flex>
            <Flex
                display={{ base: "none", md: "flex" }}
                align="center"
                borderRight="1px solid"
                borderColor="gray.200"
            >
                <Flex
                    mx={1.5}
                    padding={1}
                    cursor="pointer"
                    borderRadius={4}
                    _hover={{ bg: "gray.200" }}
                >
                    <Icon as={BsBell} fontSize={20} />
                </Flex>
                <Flex
                    mx={1.5}
                    padding={1}
                    cursor="pointer"
                    borderRadius={4}
                    _hover={{ bg: "gray.200" }}
                >
                    <Icon as={BsInstagram} fontSize={20} />
                </Flex>
                <Flex
                    mx={1.5}
                    padding={1}
                    cursor="pointer"
                    borderRadius={4}
                    _hover={{ bg: "gray.200" }}
                >
                    <Icon as={BsYoutube} fontSize={22} />
                </Flex>
            </Flex>
        </Flex>
    );
};
export default Icons;