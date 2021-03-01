import * as React from "react";
import { ChakraProvider, Box, theme, Flex, Link } from "@chakra-ui/react";

import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { UserProvider } from "./auth";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Box textAlign="center" fontSize="xl" padding={8}>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            padding="10px"
          >
            <Link href="/" justifySelf="flex-start">
              Framejoy
            </Link>
            <ColorModeSwitcher justifySelf="flex-end" />
          </Flex>
          <Main />
        </Box>
      </UserProvider>
    </ChakraProvider>
  );
};
