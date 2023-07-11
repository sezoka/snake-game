import React from "react";

enum Direction {
    up,
    right,
    left,
    down,
}

enum Cell {
    empty,
    tail,
    head,
    apple,
}

type Vec2 = {
    x: number;
    y: number;
};

type Snake = {
    dir: Direction;
    body: Vec2[];
    head_idx: number;
};

var field_width = 30;
var field_height = 10;

const offsets = {
    [Direction.up]: { x: 0, y: -1 },
    [Direction.down]: { x: 0, y: 1 },
    [Direction.left]: { x: -1, y: 0 },
    [Direction.right]: { x: 1, y: 0 },
};

export function Game(): React.ReactElement {
    const [snake, flush_snake] = use_mut(create_snake());
    const [apple, flush_apple] = use_mut<Vec2>(generate_apple(snake)!);
    const [pause, set_pause] = React.useState(true);

    const handle_key_press: EventListener = (key: any) => {
        switch (key.code) {
            case "ArrowUp":
                snake.dir = Direction.up;
                break;
            case "ArrowRight":
                snake.dir = Direction.right;
                break;
            case "ArrowLeft":
                snake.dir = Direction.left;
                break;
            case "ArrowDown":
                snake.dir = Direction.down;
                break;
            case "Space":
                set_pause(!pause);
        }
        flush_snake();
    };

    React.useEffect(() => {
        document.body.addEventListener("keydown", handle_key_press);
        return () => document.body.removeEventListener("keydown", handle_key_press);
    }, [pause]);

    const update = React.useCallback(() => {
        if (pause) {
            return;
        }

        const head = snake.body[snake.head_idx];
        const offset = offsets[snake.dir];

        if (head.x + offset.x === apple.x && head.y + offset.y === apple.y) {
            grow_snake(snake);
            const new_apple = generate_apple(snake);
            if (new_apple === null) {
                apple.x = -1;
                apple.y = -1;
            } else {
                apple.x = new_apple.x;
                apple.y = new_apple.y;
            }
            flush_apple();
        } else {
            let new_head_idx = snake.head_idx - 1;
            if (new_head_idx < 0) new_head_idx += snake.body.length;
            snake.body[new_head_idx].x = snake.body[snake.head_idx].x;
            snake.body[new_head_idx].y = snake.body[snake.head_idx].y;
            snake.body[new_head_idx].x += offset.x;
            snake.body[new_head_idx].y += offset.y;
            if (snake.body[new_head_idx].x < 0) snake.body[new_head_idx].x = field_width - 1;
            if (snake.body[new_head_idx].y < 0) snake.body[new_head_idx].y = field_height - 1;
            if (field_height <= snake.body[new_head_idx].y) snake.body[new_head_idx].y = 0;
            if (field_width <= snake.body[new_head_idx].x) snake.body[new_head_idx].x = 0;

            snake.head_idx = new_head_idx;
        }

        flush_snake();
    }, [pause]);

    use_interval(update, 0);

    let cell_size;

    if (document.body.scrollWidth * 0.9 / field_width < document.body.scrollHeight * 0.9 / field_height) {
        cell_size = document.body.scrollWidth * 0.9 / field_width;
    } else {
        cell_size = document.body.scrollHeight * 0.9 / field_height;
    }

    console.log(document.body.scrollWidth)

    const cells = [];
    let tail_num = 0;
    for (let y = 0; y < field_height; y += 1) {
        for (let x = 0; x < field_width; x += 1) {
            let cell = Cell.empty;

            if (apple.x === x && apple.y === y) {
                cell = Cell.apple;
            }
            if (snake.body[snake.head_idx].x === x && snake.body[snake.head_idx].y === y) {
                cell = Cell.head;
            } else {
                for (let i = 0; i < snake.body.length; i += 1) {
                    if (snake.body[i].x === x && snake.body[i].y === y) {
                        cell = Cell.tail;
                        tail_num = i - snake.head_idx;
                        if (tail_num < 0) tail_num += snake.body.length;
                    }
                }
            }

            let background_color;
            let shadow = "none";
            let border = "none";
            let z_index = 0;

            switch (cell) {
                case Cell.tail:
                    background_color = `rgb(${Math.max(50, Math.trunc(150 - tail_num * 3) % 200)}, 20, ${Math.max(100, Math.trunc(255 - tail_num * 3))})`;
                    break;
                case Cell.empty:
                    background_color = "#160016";
                    break;
                case Cell.head:
                    background_color = "#e0efef";
                    shadow = "#641e8f 0px 0px 24px 2px";
                    z_index = 123;
                    break;
                case Cell.apple:
                    background_color = "red";
                    border = "1px solid white";
                    shadow = "0px 0px 32px 4px #cd0d0d";
                    z_index = 123;
                    break;
            }

            cells.push(
                <div
                    style={{
                        width: cell_size + "px",
                        height: cell_size + "px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: background_color,
                        zIndex: z_index,
                        border: border,
                        boxShadow: shadow,
                    }}
                    key={y * field_width + x}
                >
                </div>
            );
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                background: "#100010",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: cell_size * field_width + "px",
                    height: cell_size * field_height + "px",
                    display: "flex",
                    flexWrap: "wrap",
                    boxSizing: "content-box",
                    border: "2px solid white",
                }}
            >
                {cells}
            </div>
        </div>
    );
}

function create_snake(): Snake {
    return {
        dir: Direction.right,
        body: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -2, y: 0 },
        ],
        head_idx: 0,
    };
}

function use_mut<T>(init_data: T): [T, () => void] {
    const [_, set_dumb_value] = React.useState(0);
    const data_ref = React.useRef(init_data);

    const flush = React.useCallback(() => {
        set_dumb_value(Date.now());
    }, []);

    return [data_ref.current, flush];
}

function use_interval(fn: () => void, ms: number): void {
    const interval = React.useRef(0);
    const prev_time = React.useRef(Date.now());

    React.useEffect(() => {
        if (Date.now() - prev_time.current < ms) {
            interval.current = setInterval(fn, ms - (Date.now() - prev_time.current));
        } else {
            interval.current = setInterval(fn, ms);
        }
        return () => {
            prev_time.current = Date.now();
            clearInterval(interval.current);
        };
    }, [fn]);
}

// const field_with_snake = new Array(field_width * field_height).fill(Cell.empty);
function generate_apple(snake: Snake): Vec2 | null {

    const x_offset = Math.trunc(Math.random() * field_width);
    const y_offset = Math.trunc(Math.random() * field_height);

    // for (let i = 0; i < snake.body.length; i += 1) {
    //     const cell = snake.body[i];
    //     field_with_snake[];
    // }

    for (let y_start = 0; y_start < field_width; y_start += 1) {
        next: for (let x_start = 0; x_start < field_height; x_start += 1) {
            const x = (x_start + x_offset) % field_width;
            const y = (y_start + y_offset) % field_height;

            for (let i = 0; i < snake.body.length; i += 1) {
                const pos = snake.body[i];
                if (pos.x === x && pos.y === y) {
                    continue next;
                }
            }

            return { x, y };
        }
    }

    return null;
}

function grow_snake(snake: Snake) {
    const new_body: Vec2[] = new Array(snake.body.length + 1);
    const head = snake.body[snake.head_idx];
    const offset = offsets[snake.dir];
    new_body[0] = { x: head.x + offset.x, y: head.y + offset.y };
    let insert_pos = 1;

    for (let i = snake.head_idx; i < snake.body.length; i += 1) {
        new_body[insert_pos] = snake.body[i];
        insert_pos += 1;
    }

    for (let i = 0; i < snake.head_idx; i += 1) {
        new_body[insert_pos] = snake.body[i];
        insert_pos += 1;
    }

    snake.body = new_body;
    snake.head_idx = 0;
}
