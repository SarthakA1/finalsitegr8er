import useDirectory from '@/hooks/useDirectory';
import { Flex, MenuItem, Icon } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';

type MenuListItemProps = {
    displayText: string;
    link: string;
    icon: IconType;
    bgGradient?: string;
    color?: string;
};

const MenuListItem: React.FC<MenuListItemProps> = ({ displayText, link, icon, bgGradient, color }) => {
    const { onSelectMenuItem } = useDirectory();

    return (
        <MenuItem width="100%" fontSize="10pt"
            _hover={{ bg: "gray.100" }} onClick={() => onSelectMenuItem({ displayText, link, icon, bgGradient, color })}>
            <Flex align="center">
                {bgGradient ? (
                    <Flex
                        align="center"
                        justify="center"
                        boxSize="18px"
                        borderRadius="4px" // Slightly rounded for mini icon
                        bgGradient={bgGradient}
                        color={color || "white"}
                        mr={2}
                        shadow="sm"
                    >
                        <Icon as={icon} fontSize="12px" />
                    </Flex>
                ) : (
                    <Icon as={icon} fontSize={20} mr={2} />
                )}
                {displayText}
            </Flex>
        </MenuItem>
    )
}
export default MenuListItem;