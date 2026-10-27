// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
const modeIcon = darkModeToggle.querySelector(".mode-icon");
const modeText = darkModeToggle.querySelector(".mode-text");
const searchInput = document.getElementById("searchInput");
const voiceSearchBtn = document.getElementById("voiceSearchBtn");
const voiceAssistant = document.getElementById("voiceAssistant");
const voiceStatus = document.getElementById("voiceStatus");
const notesToggle = document.getElementById("notesToggle");
const notesPanel = document.getElementById("notesPanel");
const studyCard = document.querySelector(".study-card");
const notesButtonLabel = notesToggle.querySelector(".button-label");
const body = document.body;
const revealCards = document.querySelectorAll(".reveal-card");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navLinks = document.getElementById("navLinks");

function setTheme(theme) {
    const isDark = theme === "dark";

    if (isDark) {
        body.setAttribute("data-theme", "dark");
    } else {
        body.removeAttribute("data-theme");
    }

    modeIcon.textContent = isDark ? "\u2600" : "\u263E";
    modeText.textContent = isDark ? "Bright Mode" : "Dark Mode";
    darkModeToggle.setAttribute("aria-label", isDark ? "Switch to bright mode" : "Switch to dark mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");

darkModeToggle.addEventListener("click", () => {
    const nextTheme = body.hasAttribute("data-theme") ? "light" : "dark";
    setTheme(nextTheme);
});

hamburgerBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");

    hamburgerBtn.classList.toggle("is-open", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
});

function createSparkles(source) {
    for (let i = 0; i < 10; i++) {
        const spark = document.createElement("span");

        spark.className = `spark spark-${i + 1}`;
        spark.textContent = "\u2726";

        source.appendChild(spark);
        window.setTimeout(() => spark.remove(), 800);
    }
}

notesToggle.addEventListener("click", () => {
    const willOpen = !studyCard.classList.contains("notes-open");

    studyCard.classList.toggle("notes-open", willOpen);
    notesPanel.setAttribute("aria-hidden", String(!willOpen));
    notesToggle.setAttribute("aria-expanded", String(willOpen));
    notesButtonLabel.textContent = willOpen ? "Hide Engineering Notes" : "Open Engineering Notes";
    createSparkles(notesToggle);
});

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18
    });

    revealCards.forEach((card) => revealObserver.observe(card));
} else {
    revealCards.forEach((card) => card.classList.add("is-visible"));
}

// Search filter functionality
function searchResources() {
    const input = searchInput.value.toLowerCase().trim();
    const resources = document.querySelectorAll(".resource-item");

    resources.forEach((resource) => {
        const resourceText = resource.textContent.toLowerCase();
        const isMatch = resourceText.includes(input);

        resource.classList.toggle("hidden", !isMatch);
    });
}

searchInput.addEventListener("input", searchResources);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

function setVoiceState(state, message) {
    const isListening = state === "listening";

    voiceSearchBtn.classList.toggle("is-listening", isListening);
    voiceAssistant.classList.toggle("is-listening", isListening);
    voiceSearchBtn.setAttribute("aria-label", isListening ? "Stop voice search" : "Start voice search");
    voiceStatus.textContent = message;
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceSearchBtn.addEventListener("click", () => {
        if (voiceSearchBtn.classList.contains("is-listening")) {
            recognition.stop();
            setVoiceState("idle", "Voice search stopped.");
            return;
        }

        try {
            setVoiceState("listening", "I am listening. Say a note, subject, or roadmap.");
            recognition.start();
        } catch (error) {
            setVoiceState("error", "Voice search is already starting. Please try again.");
        }
    });

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript.trim();

        searchInput.value = transcript;
        searchResources();
        setVoiceState("done", `Searching for "${transcript}".`);
    });

    recognition.addEventListener("end", () => {
        if (voiceSearchBtn.classList.contains("is-listening")) {
            setVoiceState("idle", "Tap the mic and tell me what to find.");
        }
    });

    recognition.addEventListener("error", (event) => {
        const message = event.error === "not-allowed"
            ? "Microphone permission is blocked. Allow mic access in Chrome."
            : "I could not hear clearly. Please try again.";

        setVoiceState("error", message);
    });
} else {
    voiceSearchBtn.disabled = true;
    setVoiceState("unsupported", "Voice search works best in Google Chrome.");
}
document.addEventListener("DOMContentLoaded", () => {
  const triggerBtn = document.getElementById('robi-trigger-btn');
  const chatWindow = document.getElementById('robi-chat-window');
  const closeBtn = document.getElementById('robi-close-btn');
  const sendBtn = document.getElementById('robi-send-btn');
  const userInput = document.getElementById('robi-user-input');
  const messagesContainer = document.getElementById('robi-chat-messages');
  const wrapper = document.getElementById('robi-chatbot-wrapper');

  // --- Drag and Drop Logic ---
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;
  let isDragMoved = false; // Tracks if the user is dragging or clicking

  // Set initial cursor style
  triggerBtn.style.cursor = 'grab';

  // 1. Mouse Events (Desktop)
  triggerBtn.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  // 2. Touch Events (Mobile)
  triggerBtn.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', dragEnd);

  function dragStart(e) {
    if (e.type === 'touchstart') {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }

    // Get current position on screen
    const rect = wrapper.getBoundingClientRect();
    
    // Switch from CSS bottom/right to JS top/left for smooth dragging
    wrapper.style.bottom = 'auto';
    wrapper.style.right = 'auto';
    wrapper.style.left = rect.left + 'px';
    wrapper.style.top = rect.top + 'px';

    initialLeft = rect.left;
    initialTop = rect.top;

    isDragging = true;
    isDragMoved = false;
    triggerBtn.style.cursor = 'grabbing'; // Change cursor while holding
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // Prevent screen scrolling on mobile while dragging

    let currentX, currentY;
    if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const diffX = currentX - startX;
    const diffY = currentY - startY;

    // If moved more than 5 pixels, it counts as a drag, not a click
    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      isDragMoved = true;
    }

    // Calculate new position
    let newLeft = initialLeft + diffX;
    let newTop = initialTop + diffY;

    // Prevent dragging the bot off the screen edges
    const maxLeft = window.innerWidth - wrapper.offsetWidth;
    const maxTop = window.innerHeight - wrapper.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    // Apply new position
    wrapper.style.left = newLeft + 'px';
    wrapper.style.top = newTop + 'px';
  }

  function dragEnd() {
    isDragging = false;
    triggerBtn.style.cursor = 'grab';
  }

  // --- Click Logic ---
  triggerBtn.addEventListener('click', (e) => {
    // If the user just finished dragging, DO NOT open the chat window
    if (isDragMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Otherwise, open the chat window normally
    chatWindow.classList.remove('robi-scale-down');
    userInput.focus();
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('robi-scale-down');
  });

  // --- Chat Interaction Logic ---
  const sendMessage = () => {
    const text = userInput.value.trim();
    if (text === '') return;

    appendMessage('robi-user', text);
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
      const botResponse = generateRobiResponse(text);
      appendMessage('robi-bot', botResponse);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
  };

  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  function appendMessage(senderClass, messageText) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('robi-message', senderClass);
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('robi-bubble');
    bubbleDiv.textContent = messageText;
    
    messageDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(messageDiv);
  }

  function generateRobiResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hi there! Ready to study?";
    } else if (lowerInput.includes('help')) {
      return "I can help you review topics, quiz you, or explain complex concepts. What do you need?";
    } else {
      return "That's an interesting topic. Let me look up the study materials for that!";
    }
  }
});