import {
  Box,
  Button,
  HStack,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useInterval,
} from "@chakra-ui/react";
import { KeyboardEvent, useEffect, useState } from "react";

enum DIRECTIONS {
  TOP,
  RIGHT,
  LEFT,
  DOWN,
}

const EMPTY_CELL = "O";
const SNAKE_CELL_BODY = "*";
const SNAKE_CELL_HEAD = "#";
const APPLE_CELL = "A";

const START_POINT = { x: 0, y: 5 };
const START_DIRECTION = DIRECTIONS.RIGHT;
const INITIAL_SNAKE = { length: 1, body: [START_POINT] };
const INITIAL_FIELD_SIZE = 10;

const INITIAL_FIELD = Array(INITIAL_FIELD_SIZE)
  .fill(null)
  .map(() => Array(10).fill(EMPTY_CELL));

INITIAL_FIELD[START_POINT.y][START_POINT.x] = SNAKE_CELL_HEAD;

const KEYS = {
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  LEFT: "ArrowLeft",
  DOWN: "ArrowDown",
};

const getInitialField = () => [...INITIAL_FIELD.map((item) => [...item])];
export const Field = () => {
  const [field, setField] = useState(getInitialField());

  const [point, setPoint] = useState(START_POINT);
  const [direction, setDirection] = useState(START_DIRECTION);
  const [snake, setSnake] = useState(INITIAL_SNAKE);

  const [isDefeat, setIsDefeat] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const generateApple = () => {
    let y;
    let x;
    const notSnakeCoords = snake.body;
    // while (x && y && x) {
      x = Math.floor(Math.random() * INITIAL_FIELD_SIZE);
      y = Math.floor(Math.random() * INITIAL_FIELD_SIZE);
    // }

    //mutable?
    field[y][x] = APPLE_CELL;
  };

  useEffect(() => {
    generateApple();
  }, []);

  const onDefeat = () => {
    onOpen();

    setIsDefeat(true);
  };

  const onRestart = () => {
    setPoint(START_POINT);
    setDirection(START_DIRECTION);
    setSnake(INITIAL_SNAKE);
    setField(getInitialField());
    generateApple();

    onClose();
    setIsDefeat(false);
  };

  const onChangeDirection = (key: KeyboardEvent<HTMLDivElement>) => {
    switch (key.code) {
      case KEYS.UP:
        setDirection(DIRECTIONS.TOP);
        break;

      case KEYS.RIGHT:
        setDirection(DIRECTIONS.RIGHT);
        break;

      case KEYS.LEFT:
        setDirection(DIRECTIONS.LEFT);
        break;

      case KEYS.DOWN:
        setDirection(DIRECTIONS.DOWN);
        break;
    }
  };

  const getNextPoint = () => {
    let newPoint = point;
    const { x, y } = point;

    switch (direction) {
      case DIRECTIONS.TOP:
        newPoint = { ...point, y: y - 1 };
        break;

      case DIRECTIONS.RIGHT:
        newPoint = { ...point, x: x + 1 };
        break;

      case DIRECTIONS.LEFT:
        newPoint = { ...point, x: x - 1 };
        break;

      case DIRECTIONS.DOWN:
        newPoint = { ...point, y: y + 1 };
        break;
    }

    return newPoint;
  };

  const onChangeMove = () => {
    if (isDefeat) return;

    const newPoint = getNextPoint();

    //check is point correct
    if (
      newPoint.x > field.length - 1 ||
      newPoint.y > field.length - 1 ||
      newPoint.x < 0 ||
      newPoint.y < 0
    ) {
      onDefeat();
      return;
    }

    if (
      snake.body
        .slice(0, snake.body.length - 1)
        .find((item) => item.x === newPoint.x && item.y === newPoint.y)
    ) {
      onDefeat();
      return;
    }

    if (field[newPoint.y][newPoint.x] === APPLE_CELL) {
      generateApple();
      increaseLength();
    }
    //mutable?
    const newField = field;
    const newBody = [newPoint, ...snake.body];

    //check length
    const cuttedBody = newBody.filter((_item, i) => i < snake.length);

    newField[newPoint.y][newPoint.x] = SNAKE_CELL_HEAD;

    if (snake.length > 1) {
      const secondPoint = snake.body[0];

      newField[secondPoint.y][secondPoint.x] = SNAKE_CELL_BODY;
    }

    // remove extra points
    // It makes a sense to devide funcs
    // callback

    newBody.forEach((item, index) => {
      const { x, y } = item;
      const correctLength = snake.length - 1;

      const lastPoint = snake.body.at(-1);

      const areLastAndFirstPointsEqual =
        lastPoint && newPoint.x === lastPoint?.x && newPoint.y === lastPoint.y;

      if (index > correctLength && !areLastAndFirstPointsEqual) {
        newField[y][x] = EMPTY_CELL;
      }
    });

    setSnake((prev) => ({ ...prev, body: cuttedBody }));
    setPoint(newPoint);
    setField(newField);
  };

  const increaseLength = () => {
    setSnake((prev) => ({ ...prev, length: prev.length + 1 }));
  };

  //to do out of component
  // const getNotRevertedField = () => {
  //   // const notRevertedField = field.
  // };
  //TODO: reverse problem

  useInterval(onChangeMove, 200);

  return (
    <Stack pos="relative">
      <VStack>
        <Box tabIndex={0} outline="none" onKeyUp={onChangeDirection}>
          {field.map((row, rowIndex) => (
            <HStack spacing={3} key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Box
                  w={4}
                  h={7}
                  key={cellIndex}
                  background={cell === EMPTY_CELL ? "initial" : "red.400"}
                  color="white"
                >
                  {cell}
                </Box>
              ))}
            </HStack>
          ))}
        </Box>
        {/* <Button onClick={increaseLength}>Increase length</Button> */}
      </VStack>

      {isOpen && (
        <Box pos="absolute" right={-135}>
          <Text>Defeat!</Text>
          <Text>Your score is: {(snake.length - 1) * 3}</Text>

          <Button onClick={onRestart}>Restart</Button>
        </Box>
      )}
    </Stack>
  );
};
