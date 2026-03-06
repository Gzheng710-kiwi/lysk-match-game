# Match Game

A fun and interactive Match-3 puzzle game built with React. Select and match three or more identical items to eliminate them and earn points.

## Features

- **7×7 Grid Gameplay**: Classic match-3 mechanics with a spacious grid
- **Basket Starting Point**: All selections must start adjacent to the basket
- **Magic Flowers**: Special 🌺 flowers that can transform into any item type
- **Reshuffle System**: 3 chances to reshuffle the board when stuck
- **Star Rating System**: Earn stars based on your score (1-3 stars)
- **Progressive Difficulty**: Limited moves per level (8 moves for level 1)
- **Smooth Animations**: Satisfying visual feedback when items are eliminated

## How to Play

1. **Select Items**: Click items adjacent to the basket to start your selection
2. **Build a Chain**: Continue clicking same-type items to extend your chain (horizontally, vertically, or diagonally)
3. **Match & Eliminate**: Select 3 or more items and click "消除" (Eliminate) to remove them
4. **Earn Points**: Each eliminated item gives 100 points
5. **Pass the Level**: Get at least 1000 points (1 star) to pass the level

### Special Mechanics

- **Magic Flowers (🌺)**: Select a magic flower with another item type to transform it and include it in your match
- **Reshuffle (🔀)**: Shuffle the board (only available when basket has no adjacent matches). You have 3 chances per level
- **Basket Movement**: The basket moves to the last eliminated item's position after each match

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Gzheng710-kiwi/lysk-match-game.git
cd match-game
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
match-game/
├── src/
│   ├── App.js          # Main game component
│   ├── index.js        # React entry point
│   └── ...
├── public/
├── package.json
└── README.md
```

## Technologies Used

- **React** - UI library
- **JavaScript (ES6+)** - Game logic
- **CSS** - Styling

## Game Rules

- You have **8 moves** per level
- Match **3+ items** of the same type to eliminate them
- Items fall from above when spaces are created
- Magic flowers have a **10% spawn rate** when items are eliminated
- The basket position changes to the last eliminated item
- **Win condition**: Achieve at least **1000 points** (1 star) before moves run out
- **Lose condition**: Run out of moves before reaching 1000 points

## Future Enhancements

- [ ] Multiple levels with increasing difficulty
- [ ] Power-ups and special abilities
- [ ] Sound effects and background music
- [ ] Leaderboard system
- [ ] Mobile optimization
- [ ] Different game themes

## Author

Gzheng710-kiwi

## License

This project is open source and available under the MIT License.

---

**Enjoy the game! **
