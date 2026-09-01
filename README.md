# Q-Script

A simple Q-learning helper library for JavaScript.

## Importing

Use the hosted script:

```html
<script src="https://limedev.xyz/lib/ai.js"></script>
```

Or use a local copy:

```html
<script src="./ai.js"></script>
```

## Usage

### Create a Q-table

```js
const name = "myNewAi";
const explorationRate = 0.1; // chance of random action during learning
const discountFactor = 0.9;  // importance of future rewards
const learningType = "max";  // "max" or "min"

const myNewAi = new qTable(name, explorationRate, discountFactor, learningType);
```

`name` is used as the key in `localStorage`, so the table persists between reloads.
`learningType` controls whether the agent prefers higher (`"max"`) or lower (`"min"`) values.

### Save transitions and learned values

Use `save(state, action, reward = 0)`:

```js
myNewAi.save("player-turn:X..O.....", "place-4", 1);
myNewAi.save("opponent-turn:X..OO....", "place-7", -1);
```

- `state`: current state key
- `action`: action taken from that state
- `reward`: immediate reward to apply to this state/action

Each `save()` call also links the previous state/action to the current state and updates the previous value using the configured `discountFactor` and `learningType`.

### Choose an action

Use `get(state, possibleActions, canExplore = false, forceLearning = false)`:

```js
const action = myNewAi.get(
  "player-turn:X..O.....",
  ["place-1", "place-2", "place-4", "place-7"],
  true,
  false
);
```

- If exploration is enabled, the agent may return a random action based on `explorationRate`.
- In normal mode, it returns the best-known action for the configured learning type.
- In `forceLearning` mode, it prefers actions that have not been explored yet.

## Notes

- Data is stored in `localStorage`.
- If no action has a learned value yet and exploration is disabled, `get()` may return `null`.
- This library expects your app to define how states/actions are represented as strings.
- This redme is writen using AI, cause I can't right now.
