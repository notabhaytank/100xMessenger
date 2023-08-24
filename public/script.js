const socket = io();

const clientsTotal = document.getElementById('client-total');

const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio('/message-tone.mp3');


const triggerWordsToEmojis = {
  react: "⚛️",
  woah: "😲",
  hey: "👋",
  lol: "😂",
  like: "🤍",
  congratulations: "🎉",
  React: "⚛️",
  Woah: "😲",
  Hey: "👋",
  Lol: "😂",
  Like: "🤍",
  Congratulations: "🎉",

};







messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Users Available: ${data}`;
});

function sendMessage() {
    if (messageInput.value === '') return;
    
    const data = {
        name: nameInput.value,
        message: processMessage(messageInput.value), 
        dateTime: new Date(),
    };
    
    socket.emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';
}

socket.on('chat-message', (data) => {
    messageTone.play();
    addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
    clearFeedback();
    const processedMessage = processMessage(data.message); 
    
    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
                ${processedMessage}
                <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
    `;

    messageContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing a message`,
    });
});

messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing a message`,
    });
});

messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: '',
    });
});

socket.on('feedback', (data) => {
    clearFeedback();
    const element = `
        <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
    `;
    messageContainer.innerHTML += element;
});

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
        element.parentNode.removeChild(element);
    });
}

function processMessage(message) {
    const words = message.split(/\s+/); // Split message into words
    const processedWords = words.map((word) => {
        // Check if the word is a trigger word and appears as a standalone word
        if (triggerWordsToEmojis.hasOwnProperty(word.toLowerCase())) {
            return triggerWordsToEmojis[word.toLowerCase()];
        }
        return word;
    });
    return processedWords.join(' '); // Reconstruct the message
}




const nameModal = document.getElementById('name-modal');
const modalNameInput = document.getElementById('modal-name-input');
const modalSubmitButton = document.getElementById('modal-submit-button');


modalSubmitButton.addEventListener('click', () => {
    const name = modalNameInput.value.trim();
    if (name !== '') {
        nameInput.value = name;
        nameModal.style.display = 'none';
        socket.emit('user-joined', name);
    }
});


window.addEventListener('load', () => {
    nameModal.style.display = 'block';


    modalNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          e.preventDefault(); 
          modalSubmitButton.click(); 
      }
    });
    


});


socket.on('user-joined', (name) => {
    clientsTotal.innerText = `Users Online ${name}`;
});
