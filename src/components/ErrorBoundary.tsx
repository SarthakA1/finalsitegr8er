import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Button, Container, Heading, Text } from '@chakra-ui/react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, info);
    }

    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxW="container.md" py={20} textAlign="center">
                    <Box bg="white" p={10} borderRadius="xl" boxShadow="lg">
                        <Heading size="lg" color="red.500">Something went wrong</Heading>
                        <Text mt={4} color="gray.600">
                            An unexpected error occurred while rendering this page.
                        </Text>
                        <Button mt={6} colorScheme="blue" onClick={this.handleReload}>
                            Reload Page
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
