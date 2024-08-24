const chatbox = document.getElementById('chatbox');
const stateSelect = document.getElementById('stateSelect');
const museumSelect = document.getElementById('museumSelect');
const ticketInput = document.getElementById('ticketInput');
const dateInput = document.getElementById('dateInput');
const getTicketsContainer = document.getElementById('getTicketsContainer');
const getTicketsButton = document.getElementById('getTicketsButton');

const museums = {
    Delhi: [
        "National Museum",
        "National Gallery of Modern Art",
        "Indira Gandhi Memorial Museum",
        "National Science Centre",
        "Railway Museum"
    ],
    Mumbai: [
        "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
        "National Gallery of Modern Art, Mumbai",
        "Mani Bhavan Gandhi Museum",
        "Dr. Bhau Daji Lad Museum",
        "RBI Monetary Museum"
    ]
};

let availableSeats = 0; 
let reservationComplete = false; 

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
        if (reservationComplete) return; 

        if (this.step < this.questions.length) {
            this.addBotMessage(this.questions[this.step]);
            this.showInputForStep(this.step);
        } else if (this.step === this.questions.length) {
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
        
   
        getTicketsContainer.style.display = 'block';
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
            availableSeats = data.availableSeats; 
            chatbot.addBotMessage(`There are ${availableSeats} seats available at this museum on ${date}.`);
        
            ticketInput.style.display = 'block'; 
            ticketInput.focus();
        })
        .catch(error => {
            console.error('Error fetching availability:', error);
            chatbot.addBotMessage('An error occurred while fetching availability.');
        });
}


ticketInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && ticketInput.value !== '') {
        const requestedTickets = parseInt(ticketInput.value);

        if (requestedTickets > availableSeats) {
            chatbot.addBotMessage('Sorry, there are not enough seats available. Please enter a smaller number.');
            ticketInput.value = '';
            ticketInput.focus();
            return; 
        }

        chatbot.addUserMessage(ticketInput.value);
        ticketInput.style.display = 'none';

        const reservationData = {
            state: stateSelect.value,
            museum: museumSelect.value,
            tickets: requestedTickets,
            date: dateInput.value
        };

    
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
            reservationComplete = true; 
            
            
            getTicketsContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error reserving tickets:', error);
            chatbot.addBotMessage('An error occurred while reserving tickets.');
        });
    }
});

getTicketsButton.addEventListener('click', () => {
    window.location.href = 'index2.html'; 
});


chatbot.nextStep();
