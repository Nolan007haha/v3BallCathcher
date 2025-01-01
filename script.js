let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let level = 1;
let username = '';
let gameInterval;

// Get stored leaderboard or initialize it
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

const router = document.getElementById('router');
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreElement = document.getElementById('score');
const finalScore = document.getElementById('player-score');
const leaderboardElement = document.getElementById('leaderboard');
const resetLeaderboardButton = document.getElementById('reset-leaderboard-button');

function initGame() {
    username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter a username to start!');
        return;
    }

    score = 0;
    level = 1;

    updateScore();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    startGame();
}

function updateScore() {
    scoreElement.textContent = `${username}'s Score: ${score} | Level: ${level} | High Score: ${highScore}`;
}

function startGame() {
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnObjects, Math.max(800 - level * 100, 200));
}

function spawnObjects() {
    spawnObject('packet');
    if (Math.random() < 0.3 + level * 0.05) spawnObject('virus');
}

function spawnObject(type) {
    const object = document.createElement('div');
    object.classList.add(type);
    object.style.left = `${Math.random() * 90}%`;
    gameContainer.appendChild(object);
    moveObject(object, type);
}

function moveObject(object, type) {
    let position = 0;
    const fallSpeed = 5 + level * 1.5;

    const interval = setInterval(() => {
        position += fallSpeed;
        object.style.top = `${position}px`;

        if (detectCollision(object)) {
            clearInterval(interval);
            gameContainer.removeChild(object);

            if (type === 'packet') handlePacketCatch();
            if (type === 'virus') handleGameOver();
        }

        if (position > gameContainer.offsetHeight) {
            clearInterval(interval);
            gameContainer.removeChild(object);
        }
    }, 20);
}

function detectCollision(object) {
    const objRect = object.getBoundingClientRect();
    const routerRect = router.getBoundingClientRect();

    return !(
        objRect.bottom < routerRect.top ||
        objRect.top > routerRect.bottom ||
        objRect.right < routerRect.left ||
        objRect.left > routerRect.right
    );
}

function handlePacketCatch() {
    score += 10;
    if (score % 50 === 0) level++;
    updateScore();
}

function handleGameOver() {
    clearInterval(gameInterval);
    highScore = Math.max(highScore, score);
    localStorage.setItem('highScore', highScore);

    saveScore(username, score); // Save player score to leaderboard
    displayLeaderboard(); // Update leaderboard display

    finalScore.textContent = `Game Over, ${username}! Final Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

function saveScore(username, score) {
    // Add player score to the leaderboard
    leaderboard.push({ username, score });
    leaderboard.sort((a, b) => b.score - a.score); // Sort by highest score
    leaderboard = leaderboard.slice(0, 5); // Keep top 5 scores
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Save to localStorage
}

function displayLeaderboard() {
    leaderboardElement.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.username} - ${entry.score}`;
        leaderboardElement.appendChild(li);
    });
}

// Reset leaderboard
function resetLeaderboard() {
    leaderboard = []; // Clear leaderboard
    localStorage.removeItem('leaderboard'); // Remove leaderboard from localStorage
    displayLeaderboard(); // Refresh leaderboard display
}

// Event Listeners
document.getElementById('start-button').addEventListener('click', initGame);
document.getElementById('restart-button').addEventListener('click', () => {
    gameOverScreen.classList.add('hidden'); // Hide Game Over Screen
    startScreen.classList.remove('hidden'); // Show Start Screen
    document.getElementById('username').value = ''; // Clear the username field
});

resetLeaderboardButton.addEventListener('click', resetLeaderboard);

document.addEventListener('keydown', (e) => {
    const routerLeft = parseInt(window.getComputedStyle(router).getPropertyValue('left'));

    if (e.key === 'ArrowLeft' && routerLeft > 0) {
        router.style.left = `${routerLeft - 20}px`;
    } else if (e.key === 'ArrowRight' && routerLeft < gameContainer.offsetWidth - router.offsetWidth) {
        router.style.left = `${routerLeft + 20}px`;
    }
});
