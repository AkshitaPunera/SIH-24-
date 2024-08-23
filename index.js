const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const stateSelect = document.getElementById('stateSelect');
const museumSelect = document.getElementById('museumSelect');
const ticketInput = document.getElementById('ticketInput');
const dateInput = document.getElementById('dateInput');

const museums = {
    Delhi: ["1", "2", "3", "4", "5"],
    Mumbai: ["1", "2", "3", "4", "5"]
};

const chatbot = {
    step: 0,
    questions: [
        "Welcome to the Museum Reservation System! Please select your state.",
        "Which museum would you like to visit?",
        "Please provide the date for your visit.",
        "How many tickets would you like to reserve?"
    ],
    responses: [],
    nextStep() {
        if (this.step < this.questions.length) {
            this.addBotMessage(this.questions[this.step]);
            this.showInputForStep(this.step);
        } else {
            this.showSummary();
        }
    },
    addBotMessage(message) {
        const messageElement = document.createElement('p');
        messageElement.classList.add('bot-message');
        messageElement.textContent = message;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight; 
    },
    addUserMessage(message) {
        const messageElement = document.createElement('p');
        messageElement.classList.add('user-message');
        messageElement.textContent = message;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight; 
        this.responses[this.step] = message;
        this.step++;
        // Only call nextStep if it has not already been triggered
        if (this.step < this.questions.length) {
            setTimeout(() => this.nextStep(), 1000); 
        }
    },
    showInputForStep(step) {
        switch (step) {
            case 0:
                this.populateStateSelect();
                stateSelect.style.display = 'block';
                break;
            case 1:
                museumSelect.style.display = 'block';
                break;
            case 2:
                dateInput.style.display = 'block';
                dateInput.focus();
                break;
            case 3:
                // Wait for date selection before showing the ticket input
                break;
        }
    },
    populateStateSelect() {
        stateSelect.innerHTML = `<option value="" disabled selected>Select your state</option>`;
        for (let state in museums) {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        }
    },
    showSummary() {
        this.addBotMessage("Thank you! Your reservation details are:");
        this.addBotMessage(`State: ${stateSelect.options[stateSelect.selectedIndex].text}`);
        this.addBotMessage(`Museum: ${this.responses[1]}`);
        this.addBotMessage(`Date: ${this.responses[2]}`);
        this.addBotMessage(`Tickets: ${this.responses[3]}`);
    }
};

stateSelect.addEventListener('change', () => {
    const selectedState = stateSelect.value;
    museumSelect.innerHTML = `<option value="" disabled selected>Select a museum</option>`;
    museums[selectedState].forEach(museum => {
        const option = document.createElement('option');
        option.value = museum;
        option.textContent = museum;
        museumSelect.appendChild(option);
    });
    museumSelect.disabled = false;
    chatbot.addUserMessage(stateSelect.options[stateSelect.selectedIndex].text);
    stateSelect.style.display = 'none';
});

museumSelect.addEventListener('change', () => {
    chatbot.addUserMessage(museumSelect.value);
    museumSelect.style.display = 'none';
    dateInput.style.display = 'block';
    dateInput.focus();
});

dateInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && dateInput.value !== '') {
        chatbot.addUserMessage(dateInput.value);
        dateInput.style.display = 'none';
        fetchAvailableSeats(museumSelect.value, dateInput.value);
    }
});

function fetchAvailableSeats(museum, date) {
    fetch(`/availability/${museum}/${date}`)
        .then(response => response.json())
        .then(data => {
            const availableSeats = data.availableSeats;
            chatbot.addBotMessage(`There are ${availableSeats} seats available at this museum on ${date}.`);
            chatbot.addBotMessage("How many seats would you like to reserve?");
            ticketInput.style.display = 'block'; // Show the ticket input field
            ticketInput.focus();
        })
        .catch(error => {
            console.error('Error fetching availability:', error);
            chatbot.addBotMessage('An error occurred while fetching availability.');
        });
}

ticketInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && ticketInput.value !== '') {
        chatbot.addUserMessage(ticketInput.value);
        ticketInput.style.display = 'none';

        // Prepare reservation data
        const reservationData = {
            state: stateSelect.value,
            museum: museumSelect.value,
            tickets: parseInt(ticketInput.value),
            date: dateInput.value
        };

        // Send reservation request
        fetch('/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationData)
        })
        .then(response => response.json())
        .then(data => {
            chatbot.addBotMessage(data.message);
            // Optionally fetch updated availability
            fetchAvailableSeats(museumSelect.value, dateInput.value);
        })
        .catch(error => {
            console.error('Error reserving tickets:', error);
            chatbot.addBotMessage('An error occurred while reserving tickets.');
        });

        // Move to the next step after reservation
        chatbot.nextStep();
    }
});

// Start the chatbot
chatbot.nextStep();
