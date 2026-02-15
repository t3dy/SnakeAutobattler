# Design Logs: Narrative Logic & Experiments

The Snake Autobattler project is an experiment in **Math-to-Myth** translation. Here is the logic behind our major architectural decisions.

## Experiment 1: The "Dread Log" vs. "The Story"
**Logic**: In v1.0, we realized that reading a log of "Moved to (4,5)" was boring. 
**Improvement**: We built a `Narrator` that translates coordinates into terrain descriptions. "Moved to (4,5)" became "Shadowed the riverbank."

## Experiment 2: Trait-Driven Pathfinding
**Logic**: Does a "Reckless" snake move differently than a "Cunning" one?
**Improvement**: In v4.0, we modified the `decideMove` logic. Reckless snakes ignore hazard memory for a 1.5x damage bonus, while Cunning snakes prioritize evasion.

## Experiment 3: The Interrupted Loop (v6.0)
**Logic**: Pure autobattlers suffer from "Passive Fatigue." 
**Improvement**: We broke the simulation loop. By forcing the player to choose during encounters, we increased emotional investment. The "Manual Choice" isn't just about stats; it's about defining the snake's legacy.

## Future Experiment: Autonomous Resolve (v7.0)
**Hypothesis**: Can we make a choice-driven game where the *player* doesn't choose?
**Approach**: By automating the v6.0 choice loop based on the snake's accumulated traits and status, we create a "Tamagotchi-with-Consequences" feel. You don't play the snake; you guide its evolution and watch its resolve unfold.
