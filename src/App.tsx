import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  theme,
  Flex,
  Container,
} from "@chakra-ui/react";

import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { UserProvider } from "./auth";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Box textAlign="center" fontSize="xl">
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            padding="10px"
          >
            <Text as="span" justifySelf="flex-start">
              Framejoy
            </Text>
            <ColorModeSwitcher justifySelf="flex-end" />
          </Flex>
          <Container>
            <Main />
          </Container>
        </Box>
      </UserProvider>
    </ChakraProvider>
  );
};
