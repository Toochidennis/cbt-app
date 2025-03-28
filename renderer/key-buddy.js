

const contentDiv = document.getElementById("content");
const observer = new MutationObserver(() => {
     console.log("Content changed! Now we can interact with new elements.");

     

     document.addEventListener("DOMContentLoaded", () => {
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
    
        const specialCharacters = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?"];
    
        let backgroundMusic;
    
        // Function to set the volume for a given audio element
        const setVolume = (audio) => {
            audio.volume = globalVolume;
        };
    
        // Function to play background music
        const playBackgroundMusic = () => {
            if (!backgroundMusic) {
                backgroundMusic = new Audio("assets/sounds/Popoi - Dorila y Mello.mp3");
                backgroundMusic.loop = true; // Enable looping
            }
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
            return Math.max(5, baseLetters - (level - 1) * 4); // Reduce 2 letters per level, minimum 5
        };
    
        // Function to generate random words or special characters based on the current level
        const getRandomWordOrChar = () => {
            const isSpecialChar = Math.random() < 0.3; // 30% chance to include a special character
            if (isSpecialChar) {
                return specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
            } else {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let word = "";
                const wordLength = level; // Word length increases with the level
                for (let i = 0; i < wordLength; i++) {
                    word += letters[Math.floor(Math.random() * letters.length)];
                }
                return word;
            }
        };
    
        // Function to generate random letters or special characters for the total sequence
        const generateTotalLetters = () => {
            totalLetters = []; // Clear the existing letters
            for (let i = 0; i < 200; i++) {
                totalLetters.push(getRandomWordOrChar()); // Generate random words or special characters
            }
        };
    
        // Function to display the next batch of letters
        const displayNextBatch = () => {
            keySequenceContainer.innerHTML = ""; // Clear the current sequence
            const batchSize = lettersPerScreenWidth(); // Calculate the number of letters to display
            const batch = totalLetters.splice(0, batchSize); // Get the next batch of letters
            batch.forEach((word) => {
                const newKey = document.createElement("span");
                newKey.classList.add("key");
                newKey.textContent = word;
                keySequenceContainer.appendChild(newKey);
            });
            currentWordIndex = 0; // Reset word index
            currentLetterIndex = 0; // Reset letter index
            highlightNextLetter(); // Highlight the first letter of the first word
        };
    
        // Function to initialize the sequence
        const initializeSequence = () => {
            generateTotalLetters(); // Generate all 200 letters
            displayNextBatch(); // Display the first batch of letters
            progress.style.width = "0%"; // Reset progress bar
            score = 0; // Reset score
            gameActive = true; // Reactivate the game
            playBackgroundMusic(); // Start or resume background music
        };
    
        // Function to highlight the next letter or special character in the current word
        const highlightNextLetter = () => {
            if (!gameActive) return; // Stop highlighting if the game is over
            keyboardKeys.forEach((key) => key.classList.remove("suggested")); // Remove previous highlights
    
            const currentWord = keySequenceContainer.children[currentWordIndex];
            if (currentWord) {
                const currentLetter = currentWord.textContent[currentLetterIndex];
                keyboardKeys.forEach((key) => {
                    const keyChar = key.dataset.char || key.textContent; // Use data-char for special characters or textContent for regular keys
                    if (keyChar && keyChar.toUpperCase() === currentLetter.toUpperCase()) {
                        if (specialCharacters.includes(currentLetter) && !shiftActive) {
                            // Highlight only if Shift is required for special characters
                            key.classList.remove("suggested");
                        } else {
                            key.classList.add("suggested"); // Highlight the suggested key
                        }
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
            setVolume(audio); // Set volume
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
            setVolume(audio); // Set volume
            audio.play();
        };
    
        // Function to play the wrong key sound
        const playWrongKeySound = () => {
            const audio = new Audio("assets/sounds/wrong-buzzer-6268.mp3");
            setVolume(audio); // Set volume
            audio.play();
        };
    
        // Function to handle typing logic for words or special characters
        const handleTyping = (inputChar) => {
            if (!gameActive) return; // Stop processing if the game is over
    
            const currentWord = keySequenceContainer.children[currentWordIndex];
            if (currentWord) {
                const currentLetter = currentWord.textContent[currentLetterIndex];
                if (inputChar.toUpperCase() === currentLetter.toUpperCase()) {
                    playClickSound(); // Play the click sound for correct key
                    currentLetterIndex++; // Move to the next letter in the word
    
                    if (currentLetterIndex === currentWord.textContent.length) {
                        // Word or special character is completely typed
                        currentWord.classList.add("correct"); // Mark the word as correct
                        setTimeout(() => {
                            currentWord.remove(); // Remove the word after 200ms
                            currentLetterIndex = 0; // Reset letter index for the new word
    
                            // Add a new word or special character to maintain the correct number of letters on the screen
                            if (keySequenceContainer.children.length < lettersPerScreenWidth()) {
                                if (totalLetters.length > 0) {
                                    const newKey = document.createElement("span");
                                    newKey.classList.add("key");
                                    newKey.textContent = totalLetters.shift(); // Remove the next letter or special character from the total list
                                    keySequenceContainer.appendChild(newKey);
                                } else if (keySequenceContainer.children.length === 0) {
                                    showGameOverModal(); // End the game if all letters are typed
                                }
                            }
    
                            currentWordIndex = 0; // Reset to the first word in the sequence
                            highlightNextLetter(); // Highlight the first letter of the next word
                        }, 200);
                        score++; // Increment score
                        updateProgressBar(); // Update the progress bar
                    } else {
                        highlightNextLetter(); // Highlight the next letter in the word
                    }
                } else {
                    playWrongKeySound(); // Play the wrong key sound
                    currentWord.classList.add("incorrect"); // Mark the word as incorrect
                    setTimeout(() => {
                        currentWord.classList.remove("incorrect"); // Remove the incorrect highlight
                    }, 200);
                }
            }
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
                if (specialCharacters.includes(inputChar) && !shiftActive) {
                    playWrongKeySound(); // Play wrong key sound if Shift is not held for special characters
                    return;
                }
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
            level = 1; // Reset to level 1
            initializeSequence(); // Restart the sequence
            startCountdown(); // Restart the timer
            highlightNextKey(); // Highlight the first key to type
        });
    
        // Next level button functionality in the modal
        nextLevelBtn.addEventListener("click", () => {
            level++; // Increment the level
            hideGameOverModal(); // Hide the modal
            initializeSequence(); // Restart the sequence with updated word length
            startCountdown(); // Restart the timer
            highlightNextLetter(); // Highlight the first letter of the first word
        });
    });
    
    

});

observer.disconnect();
observer.observe(contentDiv, { childList: true, subtree: true });



