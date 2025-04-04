const switchPage =  require( "./navigation.js");


const keySequenceContainer = document.querySelector(".key-sequence");
const progress = document.querySelector(".progress");
const restartButton = document.querySelector(".restart-btn");
const timerDisplay = document.querySelector(".timer");
const keyboardKeys = document.querySelectorAll(".keyboard .key");
const gameOverModal = document.getElementById("game-over-modal");
const scoreDisplay = document.getElementById("score-display");
const commentDisplay = document.getElementById("comment-display");
const nextLevelBtn = document.getElementById("next-level-btn");
const replayBtn = document.getElementById("replay-btn");
const levelTitle = document.getElementById("level-title");
const musicVolumeControl = document.getElementById("music-volume");
const keyVolumeControl = document.getElementById("key-volume");
const musicMuteToggle = document.getElementById("music-mute-toggle");
const musicMuteIcon = document.getElementById("music-mute-icon");
const keyMuteToggle = document.getElementById("key-mute-toggle");
const keyMuteIcon = document.getElementById("key-mute-icon");
let countdownInterval;
let score = 0;
let level = 1; // Start at level 1
const maxLevel = 6; // Maximum level
const targetScore = 50; // Target score for the progress bar
let gameActive = true; // Flag to track if the game is active
let currentWordIndex = 0; // Track the current word being typed
let currentLetterIndex = 0; // Track the current letter in the word
let totalLetters = []; // Store all 200 letters
let shiftActive = false; // Track if Shift is active
let globalVolume = 1; // Default volume
let bgmVolume = 1; // Default background music volume
let musicVolume = 1; // Default music volume
let keyVolume = 1; // Default key sound volume
let isMusicMuted = false; // Track music mute state
let isKeyMuted = false; // Track key sound mute state

let backgroundMusic;

// Function to set the volume for a given audio element
const setVolume = (audio) => {
    audio.volume = globalVolume;
};

// Update music volume when the slider changes
musicVolumeControl.addEventListener("input", (event) => {
    musicVolume = parseFloat(event.target.value);
    if (backgroundMusic) {
        backgroundMusic.volume = musicVolume;
    }
});

// Update key sound volume when the slider changes
keyVolumeControl.addEventListener("input", (event) => {
    keyVolume = parseFloat(event.target.value);
});

// Function to update the mute state for music
const updateMusicMuteState = () => {
    if (backgroundMusic) {
        backgroundMusic.muted = isMusicMuted;
    }
    musicMuteIcon.style.opacity = isMusicMuted ? "0.5" : "1"; // Dim icon when muted
};

// Function to update the mute state for key sounds
const updateKeyMuteState = () => {
    keyMuteIcon.style.opacity = isKeyMuted ? "0.5" : "1"; // Dim icon when muted
};

// Event listener for music mute toggle button
musicMuteToggle.addEventListener("click", () => {
    isMusicMuted = !isMusicMuted; // Toggle music mute state
    updateMusicMuteState(); // Apply mute state to music
});

// Event listener for key mute toggle button
keyMuteToggle.addEventListener("click", () => {
    isKeyMuted = !isKeyMuted; // Toggle key sound mute state
    updateKeyMuteState(); // Apply mute state to key sounds
});

// Function to play background music
const playBackgroundMusic = () => {
    if (!backgroundMusic) {
        backgroundMusic = new Audio("assets/sounds/bg-music.mp3");
        backgroundMusic.loop = true; // Enable looping
    }
    backgroundMusic.volume = musicVolume; // Set music volume
    backgroundMusic.muted = isMusicMuted; // Apply mute state
    backgroundMusic.play();
};

// Function to pause background music
const pauseBackgroundMusic = () => {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
};

// Function to calculate the number of letters to display based on the level
const lettersPerScreenWidth = () => {
    const screenWidth = window.innerWidth;
    const letterWidth = 40; // Approximate width of each letter in pixels
    const baseLetters = Math.floor((screenWidth * 0.6) / letterWidth); // Base number of letters for level 1
    return Math.max(7, baseLetters - (level - 1) * 4); // Reduce 2 letters per level, minimum 5
};

const englishWords = {
    2: ["an", "as", "at", "be", "by", "do", "go", "he", "if", "in", "is", "it", "me", "my", "no", "of", "on", "or", "so", "to", "up", "us", "we", 
        "am", "ok", "hi", "oh", "um", "ex", "ax", "id", "ad", "pi", "ox", "nu", "op", "lo", "yo", "ti", "xi", "za", "et", "jo"],
    3: ["and", "bat", "cat", "dog", "egg", "fan", "get", "hat", "ice", "jam", "kit", "log", "man", "net", "owl", "pen", "rat", "sun", "top", "van",
        "box", "car", "dig", "elf", "fig", "gap", "hip", "ink", "jet", "key", "lip", "map", "nap", "oak", "pet", "run", "sip", "tap", "vow", "win"],
    4: ["able", "bake", "cake", "dive", "echo", "fire", "give", "hope", "idea", "joke", "kite", "love", "make", "note", "open", "plan", "quiz", "rope", "star", "time",
        "blue", "calm", "dark", "easy", "fast", "gold", "hard", "iron", "jump", "kind", "long", "moon", "nest", "oval", "pink", "rain", "slow", "tree", "unit", "wind"],
    5: ["apple", "brave", "candy", "dance", "eagle", "flame", "grape", "house", "image", "jolly", "knife", "lemon", "magic", "noble", "ocean", "plant", "queen", "river", "stone", "table",
        "angel", "beach", "cloud", "dream", "earth", "field", "giant", "heart", "islet", "jewel", "karma", "light", "mount", "north", "oasis", "peace", "quiet", "raven", "smile", "trust"],
    6: ["planet", "rocket", "forest", "castle", "bridge", "garden", "island", "stream", "sunset", "winter", "summer", "animal", "butter", "silver", "golden", "hunter", "danger", "friend", "family", "travel",
        "action", "beauty", "charge", "desert", "effort", "flight", "glance", "honest", "insect", "jungle", "kitten", "legend", "moment", "nature", "orange", "pirate", "rescue", "spirit", "temple", "vision"]
};

let usedWords = []; // Track used words for the current level
let usedLetters = []; // Track used letters for level 1

// Function to generate random words or letters based on the current level without repetition
const getRandomWordOrChar = () => {
    if (level === 1) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const availableLetters = letters.filter(letter => !usedLetters.includes(letter));
        if (availableLetters.length === 0) {
            usedLetters = []; // Reset used letters if all letters are exhausted
        }
        const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        usedLetters.push(letter); // Mark the letter as used
        return letter;
    } else if (level >= 2 && level <= 6) {
        const availableWords = englishWords[level].filter(word => !usedWords.includes(word));
        if (availableWords.length === 0) {
            usedWords = []; // Reset used words if all words are exhausted
        }
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        usedWords.push(word); // Mark the word as used
        return word;
    }
    return "";
};

// Function to generate random letters for the total sequence
const generateTotalLetters = () => {
    totalLetters = []; // Clear the existing letters
    for (let i = 0; i < 200; i++) {
        totalLetters.push(getRandomWordOrChar()); // Generate random words
    }
};

// Function to display the next batch of letters
const displayNextBatch = () => {
    keySequenceContainer.innerHTML = ""; // Clear the current sequence
    const batchSize = lettersPerScreenWidth(); // Calculate the number of letters to display
    const batch = totalLetters.splice(0, batchSize); // Get the next batch of letters
    batch.forEach((word) => {
        const newKey = document.createElement("span");
        newKey.classList.add("intro-key");
        // Wrap each letter in a span for individual styling
        newKey.innerHTML = word
            .split("")
            .map((letter) => `<span>${letter}</span>`)
            .join("");
        
        keySequenceContainer.appendChild(newKey);
    });
    currentWordIndex = 0; // Reset word index
    currentLetterIndex = 0; // Reset letter index
    highlightNextLetter(); // Highlight the first letter of the first word
};

// Function to initialize the sequence
const initializeSequence = () => {
    usedWords = []; // Reset used words for the new level
    usedLetters = []; // Reset used letters for level 1
    generateTotalLetters(); // Generate all 200 letters
    displayNextBatch(); // Display the first batch of letters
    progress.style.width = "0%"; // Reset progress bar
    score = 0; // Reset score
    gameActive = true; // Reactivate the game
    playBackgroundMusic(); // Start or resume background music
};

// Function to highlight the next letter in the current word
const highlightNextLetter = () => {
    if (!gameActive) return; // Stop highlighting if the game is over
    keyboardKeys.forEach((key) => key.classList.remove("suggested")); // Remove previous highlights

    const currentWord = keySequenceContainer.children[currentWordIndex];
    if (currentWord) {
        const currentLetter = currentWord.textContent[currentLetterIndex];
        keyboardKeys.forEach((key) => {
            const keyChar = key.dataset.char || key.textContent; // Use data-char for special characters or textContent for regular keys
            if (keyChar && keyChar.toUpperCase() === currentLetter.toUpperCase()) {
                key.classList.add("suggested"); // Highlight the suggested key
            }
        });
    }
};

// Function to highlight the next key to press
const highlightNextKey = () => {
    if (!gameActive) return; // Stop highlighting if the game is over
    keyboardKeys.forEach((key) => key.classList.remove("suggested")); // Remove previous highlights
    const currentKey = keySequenceContainer.querySelector(".key");
    if (currentKey) {
        keyboardKeys.forEach((key) => {
            if (key.textContent.toUpperCase() === currentKey.textContent) {
                key.classList.add("suggested"); // Highlight the suggested key
            }
        });
    }
};

// Function to update the progress bar
const updateProgressBar = () => {
    const progressPercentage = (score / targetScore) * 100;
    progress.style.width = `${Math.min(progressPercentage, 100)}%`; // Cap at 100%
};

// Function to start the countdown timer
const startCountdown = () => {
    let timeLeft = 60; // 60 seconds
    timerDisplay.textContent = "01:00"; // Display initial time
    countdownInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(countdownInterval); // Stop the timer if the game is over
            return;
        }
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showGameOverModal(); // Show the "Game Over" modal
        }
    }, 1000);
};

// Function to play the game-over sound
const playGameOverSound = () => {
    pauseBackgroundMusic(); // Pause background music
    const audio = new Audio("assets/sounds/game-over.wav");
    audio.volume = musicVolume; // Use music volume for the game-over sound
    audio.muted = isMusicMuted; // Apply mute state for music
    audio.play();
    audio.addEventListener("ended", () => {
        playBackgroundMusic(); // Resume background music after game-over sound ends
    });
};

// Function to show the "Game Over" modal
const showGameOverModal = () => {
    gameActive = false; // Deactivate the game
    playGameOverSound(); // Play the game-over sound
    gameOverModal.classList.remove("hidden");
    scoreDisplay.textContent = `Your Score: ${score}`;
    if (level < maxLevel) {
        levelTitle.textContent = `Level ${level} Complete!`;
        nextLevelBtn.style.display = "inline-block"; // Show the "Next" button
        replayBtn.textContent = "Replay Level";
    } else {
        levelTitle.textContent = "Game Over!";
        nextLevelBtn.style.display = "none"; // Hide the "Next" button
        replayBtn.textContent = "Replay Game";
    }
    commentDisplay.textContent = score >= targetScore ? "Amazing job!" : "Keep practicing!";
};

// Function to hide the "Game Over" modal
const hideGameOverModal = () => {
    gameOverModal.classList.add("hidden");
    score = 0; // Reset score
};

// Initialize the sequence and start the timer on page load
initializeSequence();
startCountdown();

// Start background music
playBackgroundMusic();

// Function to play the keyboard click sound for correct keys
const playClickSound = () => {
    const audio = new Audio("assets/sounds/key-clack1.wav");
    audio.volume = keyVolume; // Set key sound volume
    audio.muted = isKeyMuted; // Apply mute state
    audio.play();
};

// Function to play the wrong key sound
const playWrongKeySound = () => {
    const audio = new Audio("assets/sounds/wrong-buzzer-6268.mp3");
    audio.volume = keyVolume; // Set key sound volume
    audio.muted = isKeyMuted; // Apply mute state
    audio.play();
};

// Function to handle typing logic for words
const handleTyping = (inputChar) => {
    if (!gameActive) return; // Stop processing if the game is over

    const currentWord = keySequenceContainer.children[currentWordIndex];
    if (currentWord) {
        const letterSpans = currentWord.querySelectorAll("span"); // Get individual letter spans

        if (letterSpans[currentLetterIndex].classList.contains("incorrect")) {
            return; // Skip processing if the letter is already marked incorrect
        }

        const currentLetter = currentWord.textContent[currentLetterIndex];
        if (inputChar.toUpperCase() === currentLetter.toUpperCase()) {
            playClickSound(); // Play the click sound for correct key
            letterSpans[currentLetterIndex].classList.add("correct"); // Mark the letter as correct
            currentLetterIndex++; // Move to the next letter in the word
        } else {
            playWrongKeySound(); // Play the wrong key sound
            letterSpans[currentLetterIndex].classList.add("incorrect"); // Mark the letter as incorrect
            currentWord.classList.add("incorrect"); // Mark the entire word as incorrect
            setTimeout(() => {
                currentWord.remove(); // Remove the word after 200ms
                resetWordState(); // Reset word state
            }, 200);
            return; // Stop further processing for this word
        }

        if (currentLetterIndex === currentWord.textContent.length) {
            // Word is completely typed
            currentWord.classList.add("correct"); // Mark the word as correct
            setTimeout(() => {
                currentWord.remove(); // Remove the word after 200ms
                resetWordState(); // Reset word state
            }, 200);
            score++; // Increment score
            updateProgressBar(); // Update the progress bar
        } else {
            highlightNextLetter(); // Highlight the next letter in the word
        }
    }
};

// Function to reset word state after a word is removed
const resetWordState = () => {
    currentLetterIndex = 0; // Reset letter index for the new word
    if (keySequenceContainer.children.length < lettersPerScreenWidth()) {
        const newKey = document.createElement("span");
        newKey.classList.add("key");
        newKey.innerHTML = getRandomWordOrChar()
            .split("")
            .map((letter) => `<span>${letter}</span>`)
            .join("");
        keySequenceContainer.appendChild(newKey);
    }
    currentWordIndex = 0; // Reset to the first word in the sequence
    highlightNextLetter(); // Highlight the first letter of the next word
};

// Function to toggle the visibility of dropdowns on click
const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle("hidden"); // Toggle the clicked dropdown
};

// Event listener for keydown
document.addEventListener("keydown", (event) => {
    if (!gameActive) return; // Stop processing if the game is over

    if (event.key === "Shift") {
        shiftActive = true; // Activate Shift
        highlightNextLetter(); // Update suggestions to reflect Shift state
        return;
    }

    const inputChar = shiftActive
        ? keyboardKeys.find((key) => key.dataset.char === event.key)?.dataset.char || event.key
        : event.key;

    if (inputChar) {
        handleTyping(inputChar); // Handle typing logic
    }
});

// Event listener for keyup to deactivate Shift
document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        shiftActive = false; // Deactivate Shift
        highlightNextLetter(); // Update suggestions to reflect Shift state
    }
});

// Event listener for mouse clicks on keys
keyboardKeys.forEach((key) => {
    key.addEventListener("click", () => {
        const inputChar = shiftActive && key.dataset.char ? key.dataset.char : key.textContent;
        handleTyping(inputChar); // Handle typing logic
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
        shiftActive = true; // Activate Shift
    }
    handleTyping(event); // Handle typing logic
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        shiftActive = false; // Deactivate Shift
    }
});

document.addEventListener("keydown", (event) => {
    if (!gameActive) return; // Stop highlighting keys if the game is over
    // Highlight the pressed key on the keyboard
    keyboardKeys.forEach((key) => {
        if (key.textContent.toUpperCase() === event.key.toUpperCase()) {
            key.classList.add("active");
            setTimeout(() => key.classList.remove("active"), 200); // Remove highlight after 200ms
        }
    });
});

// Restart button functionality
restartButton.addEventListener("click", () => {
    clearInterval(countdownInterval); // Stop the current timer
    initializeSequence(); // Restart the sequence
    startCountdown(); // Restart the timer
});

// Replay button functionality in the modal
replayBtn.addEventListener("click", () => {
    hideGameOverModal(); // Hide the modal
    clearInterval(countdownInterval); // Stop the current timer
    if (level === maxLevel) {
        level = 1; // Reset to level 1 if the game is over
    }
    initializeSequence(); // Restart the sequence for the current level
    startCountdown(); // Restart the timer
    highlightNextLetter(); // Highlight the first letter of the first word
});

// Next level button functionality in the modal
nextLevelBtn.addEventListener("click", () => {
    level++; // Increment the level
    hideGameOverModal(); // Hide the modal
    initializeSequence(); // Restart the sequence with updated word length
    startCountdown(); // Restart the timer
    highlightNextLetter(); // Highlight the first letter of the first word
});
