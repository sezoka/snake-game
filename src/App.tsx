import { HStack } from "@chakra-ui/react";
import { Field } from "./components/Field";

function App() {
  return (
    <HStack h="100vh" justify="center" bg="gray.900">
      <Field />
    </HStack>
  );
}

export default App;
