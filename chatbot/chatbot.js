import { AppointmentHandler } from "./appointment.js";
import {
  LOCATIONS,
  SERVICES,
  PAIN_AREAS,
  FAQs,
  SPELLING_CORRECTIONS,
  BUTTON_OPTIONS,
  generatePainAreaButtons,
} from "./config.js";

document.addEventListener("DOMContentLoaded", function () {

  // Get chatbot elements
  const mainChatbot = document.querySelector('#main-chatbot-container .pt-chatbot');
  const mainMessages = document.querySelector('#main-chatbot-container .pt-chatbot-messages');
  const chatLink = document.getElementById('chatLink');
  const closeButton = document.querySelector('#main-chatbot-container .pt-close-button');
  const sendButton = document.querySelector('#main-chatbot-container .pt-send-button');
  const inputField = document.querySelector('#main-chatbot-container .pt-chatbot-input input');
  
  // Handle chat link click
  chatLink?.addEventListener('click', function(e) {
      e.preventDefault();
      if (mainChatbot.style.display === 'flex') {
          mainChatbot.style.display = 'none';
          mainMessages.innerHTML = '';
      } else {
          mainChatbot.style.display = 'flex';
          initializeChatbot();
      }
  });

  // Handle close button
  closeButton?.addEventListener('click', function() {
      mainChatbot.style.display = 'none';
      mainMessages.innerHTML = '';
  });

  // Initialize chatbot functionality
  function initializeChatbot() {
    const messagesContainer = mainMessages;

    // Move startInitialChat inside initializeChatbot
    function startInitialChat() {
      messagesContainer.innerHTML = '';

      // First message
      addBotMessage("Welcome to Theramedic Rehab! I'm here to assist you.");

      // Second message with a slight delay
      setTimeout(() => {
        addBotMessage("How can I help you today?");
      }, 1000);

      // Third message with options after a delay
      setTimeout(() => {
        showOptions(BUTTON_OPTIONS.main);
      }, 1500);
    }

    // Start chat immediately when initialized
    startInitialChat();

    // Chat state
    let appointmentStage = null;
    let appointmentDetails = {
      name: "",
      phone: "",
      email: "",
      location: "",
    };

    // Add conversation state
    let conversationState = {
      currentFlow: null,
      lastPainArea: null,
      formData: {},
    };

    // Send message
    sendButton?.addEventListener("click", sendUserMessage);

    // Send message on Enter key
    inputField?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendUserMessage();
      }
    });

    // Function to send user message
    function sendUserMessage() {
      const message = inputField.value.trim();
      if (!message) return;

      // Add user message to chat
      addUserMessage(message);

      // Show typing indicator before response
      showTypingIndicator().then(() => {
        // Handle user message
        handleUserMessage(message);
      });

      // Clear input field
      inputField.value = "";
    }

    // Add typing indicator
    function showTypingIndicator() {
      return new Promise((resolve) => {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator pt-bot-message";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Remove typing indicator after random time between 1-2 seconds
        setTimeout(() => {
          indicator.remove();
          resolve();
        }, Math.random() * 1000 + 1000);
      });
    }

    // Add bot message with typing effect
    function addBotMessage(message, speed = 30) {
      if (Array.isArray(message)) {
        let chainPromise = Promise.resolve();
        message.forEach((msg) => {
          chainPromise = chainPromise.then(() => {
            return new Promise((resolve) => {
              const messageElement = document.createElement("div");
              messageElement.className = "pt-bot-message";
              messagesContainer.appendChild(messageElement);

              // Type out the message
              typeText(messageElement, msg, speed).then(resolve);
            });
          });
        });
        return chainPromise;
      } else {
        return new Promise((resolve) => {
          const messageElement = document.createElement("div");
          messageElement.className = "pt-bot-message";
          messagesContainer.appendChild(messageElement);

          // Type out the message
          typeText(messageElement, message, speed).then(resolve);
        });
      }
    }

    // Type text effect
    function typeText(element, text, speed) {
      return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, speed);
      });
    }

    // Add user message to chat
    function addUserMessage(message) {
      const messageElement = document.createElement("div");
      messageElement.className = "pt-user-message";
      messageElement.textContent = message;
      messagesContainer.appendChild(messageElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Correct spelling in user message
    function correctSpelling(text) {
      let correctedText = text.toLowerCase();

      // Apply spelling corrections
      Object.keys(SPELLING_CORRECTIONS).forEach((misspelled) => {
        const regex = new RegExp(`\\b${misspelled}\\b`, "gi");
        correctedText = correctedText.replace(
          regex,
          SPELLING_CORRECTIONS[misspelled]
        );
      });

      return correctedText;
    }

    // Enhanced pain detection function
    function detectPainAreas(message) {
      const lowerMessage = message.toLowerCase();
      const detectedAreas = new Set();

      // Common pain-related words
      const painWords = ["pain", "ache", "hurt", "sore", "stiff", "discomfort"];
      const hasGeneralPain = painWords.some((word) =>
        lowerMessage.includes(word)
      );

      // Direct area mentions
      Object.entries(PAIN_AREAS).forEach(([key, data]) => {
        const searchTerms = [
          key.replace("_", " "),
          data.display.toLowerCase(),
          ...data.treatments.map((t) => t.toLowerCase()),
        ];
        if (searchTerms.some((term) => lowerMessage.includes(term))) {
          detectedAreas.add({ key, data });
        }
      });

      // Specific condition mapping
      const conditionMap = {
        head_pain: ["headache", "migraine", "tmj", "jaw", "temple"],
        shoulder_pain: [
          "rotator cuff",
          "frozen shoulder",
          "impingement",
          "shoulder strain",
          "labral tear",
          "deltoid",
          "scapula",
          "bursitis",
        ],
        back_pain: [
          "sciatica",
          "lumbar",
          "spine",
          "spinal",
          "lower back",
          "upper back",
        ],
        neck_pain: ["whiplash", "cervical", "tech neck", "shoulder"],
        hand_wrist_pain: ["carpal", "tunnel", "wrist", "finger", "thumb"],
        foot_ankle_pain: ["heel", "plantar", "fasciitis", "arch", "ankle"],
        knee_pain: ["acl", "mcl", "meniscus", "patella", "runner"],
        hip_pain: ["bursitis", "arthritis", "groin"],
        elbow_pain: ["tennis elbow", "golfer", "tendonitis"],
        pelvic_floor: ["incontinence", "bladder", "prolapse"],
      };

      // Check for specific conditions
      Object.entries(conditionMap).forEach(([key, terms]) => {
        if (terms.some((term) => lowerMessage.includes(term))) {
          detectedAreas.add({ key, data: PAIN_AREAS[key] });
        }
      });

      return Array.from(detectedAreas);
    }

    // Add this after detectPainAreas function
    function detectServices(message) {
      const lowerMessage = message.toLowerCase();
      const detectedServices = new Set();

      // Check all services in all categories
      Object.entries(SERVICES).forEach(([category, categoryData]) => {
        Object.entries(categoryData.services).forEach(([key, service]) => {
          // Check service name
          if (lowerMessage.includes(service.name.toLowerCase())) {
            detectedServices.add({ key, service, category });
          }
          // Check keywords if they exist
          if (service.keywords) {
            service.keywords.forEach(keyword => {
              if (lowerMessage.includes(keyword.toLowerCase())) {
                detectedServices.add({ key, service, category });
              }
            });
          }
        });
      });

      return Array.from(detectedServices);
    }

    // Modify handleUserMessage function - add this case before the pain detection
    function handleUserMessage(message) {
      const correctedMessage = correctSpelling(message);
      const lowerMessage = correctedMessage.toLowerCase();

      // Check for insurance query
      if (/(do you (?:accept|take)|covered by|insurance plan) .+/i.test(message)) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.insuranceQuery).then(() => {
            startAppointmentScheduling();
          });
        });
        return;
      }

      // Check for treatment plan query
      if (/(what's|whats|what is).*(?:included|treatment plan|therapy plan)/i.test(message)) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.treatmentPlan).then(() => {
            startAppointmentScheduling();
          });
        });
        return;
      }

      // Check for payment plans
      if (/(?:payment plan|package|financing|financial)/i.test(message)) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.paymentPlans).then(() => {
            startAppointmentScheduling();
          });
        });
        return;
      }

      // Check for cost query
      if (/(?:cost|price|fee|how much|charge)/i.test(message)) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.costQuery).then(() => {
            startAppointmentScheduling();
          });
        });
        return;
      }

      // Check for specific appointment/treatment request
      if (/(?:book|schedule|appointment for|treatment for) .+/i.test(message)) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.genericAppointment).then(() => {
            startAppointmentScheduling();
          });
        });
        return;
      }

      // Check for service-related queries first
      const detectedServices = detectServices(lowerMessage);
      if (detectedServices.length > 0 && !appointmentStage) {
        handleServiceQuery(detectedServices);
        return;
      }

      // Check for pain mentions first
      const detectedPainAreas = detectPainAreas(lowerMessage);
      if (detectedPainAreas.length > 0 && !appointmentStage) {
        handlePainMessage(detectedPainAreas);
        return;
      }

      // Handle appointment flow
      if (appointmentStage) {
        handleAppointmentFlow(message);
        return;
      }

      // Handle conversation flow
      if (conversationState.currentFlow) {
        handleConversationFlow(message);
        return;
      }

      // Handle FAQs
      if (
        lowerMessage.includes("service") ||
        lowerMessage.includes("what do you do") ||
        lowerMessage.includes("treat")
      ) {
        showServiceCategories()
      } else if (
        lowerMessage.includes("hour") ||
        lowerMessage.includes("open")
      ) {
        addBotMessage(FAQs.hours);
      } else if (
        lowerMessage.includes("insurance") ||
        lowerMessage.includes("pay")
      ) {
        addBotMessage(FAQs.insurance).then(() => startAppointmentScheduling());
      } else if (
        lowerMessage.includes("location") ||
        lowerMessage.includes("address") ||
        lowerMessage.includes("where")
      ) {
        addBotMessage(FAQs.locations);
      } else if (
        lowerMessage.includes("appointment") ||
        lowerMessage.includes("schedule") ||
        lowerMessage.includes("book")
      ) {
        startAppointmentScheduling();
      } else if (/(insurance|accept|coverage)/i.test(lowerMessage)) {
        handleInsuranceQuery();
      } else if (/(cost|price|fee)/i.test(lowerMessage)) {
        handleCostQuery();
      } else if (/(certified|qualified|experience)/i.test(lowerMessage)) {
        handleTherapistQuery();
      } else if (/(pain|hurt|ache|sore)/i.test(lowerMessage)) {
        showTypingIndicator().then(() => {
          addBotMessage(
            "What type of pain are you experiencing? We treat many conditions."
          ).then(() => {
            showOptions(BUTTON_OPTIONS.painAreas);
          });
        });
      } else {
        handleRandomInput();
      }
    }

    // Enhanced pain message handler
    function handlePainMessage(detectedAreas) {
      if (detectedAreas.length === 1) {
        const { key, data } = detectedAreas[0];
        conversationState.lastPainArea = key;

        return showTypingIndicator().then(() => {
          addBotMessage([
            `I understand you're experiencing ${data.display.toLowerCase()} issues.`,
            data.description,
            `Our specialists use: ${data.treatments.join(", ")}.`,
            "Would you like to:",
          ]).then(() => {
            showOptions([
              {
                text: `📅 Schedule for ${data.display}`,
                type: "appointment",
                area: key,
              },
              {
                text: `ℹ️ More about ${data.display} treatment`,
                type: "more_info",
                area: key,
              },
              { text: "🤔 I have other pain areas", type: "other_pain" },
            ]);
          });
        });
      } else if (detectedAreas.length > 1) {
        return showTypingIndicator().then(() => {
          addBotMessage([
            "I notice you're experiencing pain in multiple areas.",
            "Which area is causing you the most concern right now?",
          ]).then(() => {
            showOptions(
              detectedAreas.map(({ key, data }) => ({
                text: `${data.icon} ${data.display}`,
                type: "pain",
                area: key,
              }))
            );
          });
        });
      } else {
        return showTypingIndicator().then(() => {
          addBotMessage([
            "I want to help you with your pain. Please select the area that's bothering you:",
          ]).then(() => {
            showOptions(generatePainAreaButtons());
          });
        });
      }
    }

    // Handle service related queries
    function handleServiceMessage(serviceType, category) {
      const service = SERVICES[category]?.services[serviceType];
      if (!service) return handleRandomInput();

      showTypingIndicator().then(() => {
        const messages = [
          `Our ${service.name} service includes:`,
          service.description
        ];

        if (service.details) {
          messages.push("We provide:");
          messages.push(...service.details.map(detail => `• ${detail}`));
        }

        if (service.duration) {
          messages.push(`Session duration: ${service.duration}`);
        }

        if (service.frequency) {
          messages.push(`Typical frequency: ${service.frequency}`);
        }

        messages.push("Would you like to schedule a consultation?");

        addBotMessage(messages).then(() => {
          showOptions([
            {
              text: `📅 Schedule ${service.name}`,
              type: "appointment",
              service: serviceType,
            },
            { text: "❓ More Questions", type: "questions" },
            { text: "🔄 View Other Services", type: "service" }
          ]);
        });
      });
    }

    // Show service categories
    function showServiceCategories() {
      showTypingIndicator().then(() => {
        addBotMessage("What type of service are you interested in?").then(() => {
          const serviceButtons = Object.entries(SERVICES).map(([category, data]) => ({
            text: `${data.title}`,
            type: "service_category",
            category: category
          }));
          showOptions(serviceButtons);
        });
      });
    }

    // Show services in a category
    function showServicesInCategory(category) {
      const categoryData = SERVICES[category];
      if (!categoryData) return handleRandomInput();

      showTypingIndicator().then(() => {
        addBotMessage(`Here are our ${categoryData.title}:`).then(() => {
          const serviceButtons = Object.entries(categoryData.services).map(([key, service]) => ({
            text: `${service.icon} ${service.name}`,
            type: "service_detail",
            service: key,
            category: category
          }));
          showOptions([
            ...serviceButtons,
            { text: "↩️ Back to Categories", type: "service" }
          ]);
        });
      });
    }

    // Function to show more pain areas if the user requests them
    function showMorePainAreas() {
      // Get the areas that weren't shown in the first set
      const remainingAreas = Object.entries(PAIN_AREAS)
        .slice(5)
        .map(([key, data]) => ({
          text: `${data.icon} ${data.display}`,
          type: "pain",
          area: key,
          description: data.description,
        }));

      if (remainingAreas.length > 0) {
        addBotMessage("Here are additional areas we treat:").then(() => {
          showOptions(remainingAreas);
        });
      }
    }

    // Fix the startAppointmentScheduling function
    function startAppointmentScheduling(option = {}) {
      // Get elements
      const chatbotInput = document.querySelector('#main-chatbot-container .pt-chatbot-input');
      const template = document.querySelector('#appointment-form-template');
      const originalForm = template.content.querySelector('#appointment-form');
      
      // Hide regular input
      if (chatbotInput) {
          chatbotInput.style.display = 'none';
      }
  
      // Clone and show form
      const form = originalForm.cloneNode(true);
      form.style.display = 'block';
  
      // Add locations to select
      const locationSelect = form.querySelector('select[name="location"]');
      Object.entries(LOCATIONS).forEach(([key, data]) => {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = data.name;
          locationSelect.appendChild(option);
      });
  
      // Pre-select location if provided
      if (option.location && option.preselect) {
          locationSelect.value = option.location;
      }
  
      messagesContainer.appendChild(form);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
      // Form submission handler
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleFormSubmission(form);
      });
  
      // Cancel button handler
      form.querySelector('.pt-cancel-form').addEventListener('click', () => {
          form.remove();
          if (chatbotInput) {
              chatbotInput.style.display = 'flex';
          }
      });
  }

    // Validate US phone number
    function validatePhoneNumber(phone) {
      const digits = phone.replace(/\D/g, "");
      return digits.length === 10;
    }

    // Format phone number
    function formatPhoneNumber(phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) return phone;

      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    // Validate email
    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function handleFormSubmission(form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      let isValid = true;

      // Clear previous errors
      form
        .querySelectorAll(".error-message")
        .forEach((el) => (el.style.display = "none"));
      form
        .querySelectorAll("input, select")
        .forEach((el) => (el.style.borderColor = "#ddd"));

      // Validate fields
      if (!data.name.trim()) {
        showError(form, "name", "Please enter your name");
        isValid = false;
      }

      if (!validatePhoneNumber(data.phone)) {
        showError(form, "phone", "Please enter a valid 10-digit phone number");
        isValid = false;
      }

      if (!validateEmail(data.email)) {
        showError(form, "email", "Please enter a valid email address");
        isValid = false;
      }

      if (!data.location) {
        showError(form, "location", "Please select a location");
        isValid = false;
      }

      if (isValid) {
        data.phone = formatPhoneNumber(data.phone);
        completeAppointmentScheduling(LOCATIONS[data.location], data);
        form.remove();
        document.querySelector(".pt-chatbot-input").style.display = "flex";
      }
    }

    function showError(form, fieldName, message) {
      const group = form
        .querySelector(`[name="${fieldName}"]`)
        .closest(".form-group");
      group.querySelector(".error-message").textContent = message;
      group.querySelector(".error-message").style.display = "block";
      group.querySelector("input, select").style.borderColor = "#dc3545";
    }

    function completeAppointmentScheduling(location, data) {
      let painAreaText = "your condition";
      if (
        conversationState.lastPainArea &&
        PAIN_AREAS[conversationState.lastPainArea]
      ) {
        painAreaText =
          PAIN_AREAS[conversationState.lastPainArea].display.toLowerCase();
      }

      showTypingIndicator().then(() => {
        addBotMessage([
          "🎉 Appointment Request Received!",
          `Name: ${data.name}`,
          `Phone: ${data.phone}`,
          `Email: ${data.email}`,
          `Location: ${location.name}`,
          "Our team will contact you within 24 hours to confirm your appointment.",
          "Thank you for choosing Theramedic Rehab!",
        ]).then(() => {
          showOptions([
            // { text: "📅 View Appointment Details", type: "appointment_details" },
            { text: "📞 I have more questions", type: "questions" },
            { text: "🏠 Return to Main Menu", type: "back_to_main" },
          ]);
        });
      });

      submitAppointment({
        ...data,
        location: location.name,
        address: location.address,
      });
    }

    // Submit appointment to server
    function submitAppointment(details) {
      console.log("Appointment submitted:", details);
      // Server submission code here
    }

    // Clear conversation
    function clearConversation() {
      messagesContainer.innerHTML = "";
      conversationState = {
        currentFlow: null,
        lastPainArea: null,
        formData: {},
      };
      appointmentStage = null;
    }

    // Handle random input with enhanced detection
    function handleRandomInput() {
      // Check for common intents that might not have been caught
      const lowerMessage = inputField.value.toLowerCase();

      if (
        lowerMessage.includes("hello") ||
        lowerMessage.includes("hi ") ||
        lowerMessage.includes("hey")
      ) {
        addBotMessage("👋 Hello! How can I help you today?").then(() => {
          showOptions(BUTTON_OPTIONS.main);
        });
      } else if (
        lowerMessage.includes("thanks") ||
        lowerMessage.includes("thank you")
      ) {
        addBotMessage(
          "You're welcome! Is there anything else I can help you with today?"
        );
      } else {
        // Default response with helpful options
        addBotMessage([
          "I'm not sure I understood that completely. Let me help you with some common questions:",
        ]).then(() => {
          showOptions(BUTTON_OPTIONS.main);
        });
      }
    }

    // Show response options as buttons
    function showOptions(options) {
      const optionsContainer = document.createElement("div");
      optionsContainer.className = "pt-options-container";

      options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "pt-option-button";
        button.textContent = option.text;

        button.addEventListener("click", () => {
          // Handle button click based on type
          handleOptionClick(option);
        });

        optionsContainer.appendChild(button);
      });

      messagesContainer.appendChild(optionsContainer);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle option button clicks
    function handleOptionClick(option) {
      // Add the option text as a user message
      addUserMessage(option.text);

      // Handle based on option type
      switch (option.type) {
        case "appointment":
          startAppointmentScheduling(option);
          break;

        case "staff":
          showTypingIndicator().then(() => {
            addBotMessage([
              "Our therapists are all licensed professionals with specialized training.",
              "Would you like to schedule a consultation with one of our experts?",
            ]).then(() => {
              showOptions([
                { text: "📅 Yes, schedule now", type: "appointment" },
                { text: "📞 I have more questions", type: "questions" },
              ]);
            });
          });
          break;

        case "questions":
          showTypingIndicator().then(() => {
            addBotMessage("What would you like to know more about?").then(
              () => {
                showOptions([
                  { text: "💼 Insurance & Payment", type: "insurance" },
                  { text: "⏰ Treatment Duration", type: "duration" },
                  { text: "🧪 Treatment Methods", type: "methods" },
                  { text: "🩺 Our Specialties", type: "specialties" },
                ]);
              }
            );
          });
          break;

        case "locations":
          showTypingIndicator().then(() => {
            addBotMessage(FAQs.locations).then(() => {
              const locationButtons = Object.entries(LOCATIONS).map(
                ([key, data]) => ({
                  text: `📍 ${data.name}`,
                  type: "location_details",
                  location: key,
                })
              );
              showOptions(locationButtons);
            });
          });
          break;

        case "location_details":
          if (option.location && LOCATIONS[option.location]) {
            const loc = LOCATIONS[option.location];
            showTypingIndicator().then(() => {
              addBotMessage([
                `📍 ${loc.name}`,
                `Address: ${loc.address}`,
                `Hours: Monday-Friday 9:00 AM - 6:00 PM`,
                `Would you like to schedule an appointment at this location?`,
              ]).then(() => {
                showOptions([
                  {
                    text: "📅 Schedule Here",
                    type: "appointment",
                    location: option.location,
                    preselect: true,
                  },
                  { text: "↩️ Back to Locations", type: "locations" },
                ]);
              });
            });
          }
          break;

        case "pain":
          if (option.area && PAIN_AREAS[option.area]) {
            const painData = PAIN_AREAS[option.area];
            conversationState.lastPainArea = option.area;

            showTypingIndicator().then(() => {
              addBotMessage([
                `We specialize in treating ${painData.display.toLowerCase()}.`,
                `Our approach includes: ${painData.treatments.join(", ")}.`,
                painData.description,
                `Would you like to schedule an appointment with a specialist?`,
              ]).then(() => {
                showOptions([
                  {
                    text: "📅 Yes, schedule now",
                    type: "appointment",
                    area: option.area,
                  },
                  {
                    text: "ℹ️ Tell me more",
                    type: "more_info",
                    area: option.area,
                  },
                  { text: "🔄 Other pain areas", type: "other_pain" },
                ]);
              });
            });
          }
          break;

        case "more_info":
          if (option.area && PAIN_AREAS[option.area]) {
            const painData = PAIN_AREAS[option.area];
            showTypingIndicator().then(() => {
              addBotMessage([
                `For ${painData.display.toLowerCase()}, our treatment approach is personalized to your needs.`,
                `We typically recommend 2-3 sessions per week initially, with most patients seeing improvement within 4-6 weeks.`,
                `Our therapists use a combination of ${painData.treatments.join(
                  ", "
                )} to address your specific condition.`,
                `Would you like to get started with treatment?`,
              ]).then(() => {
                showOptions([
                  {
                    text: "📅 Schedule Appointment",
                    type: "appointment",
                    area: option.area,
                  },
                  { text: "❓ More Questions", type: "questions" },
                ]);
              });
            });
          }
          break;

        case "other_pain":
          showTypingIndicator().then(() => {
            addBotMessage("What other pain areas are you experiencing?").then(
              () => {
                showOptions(BUTTON_OPTIONS.painAreas);
              }
            );
          });
          break;

        case "more_pain_areas":
          showMorePainAreas();
          break;

        case "insurance":
          showTypingIndicator().then(() => {
            addBotMessage([
              "We accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, Cigna, and Medicare.",
              "Most plans cover physical therapy and charge you according to the services provided.",
              "We'll verify your benefits before your first appointment and explain any costs.",
              "Would you like to check your coverage with us?",
            ]).then(() => {
              showOptions([
                { text: "👍 Yes, check my coverage", type: "appointment" },
                { text: "❓ More Questions", type: "questions" },
              ]);
            });
          });
          break;

        case "duration":
          showTypingIndicator().then(() => {
            addBotMessage([
              "Most of our patients attend therapy 2-3 times per week initially.",
              "A typical course of treatment ranges from 6-12 weeks, though this varies based on your condition and progress.",
              "Each session lasts approximately 45-60 minutes.",
              "Would you like to get started with your treatment plan?",
            ]).then(() => {
              showOptions([
                { text: "📅 Schedule First Visit", type: "appointment" },
                { text: "❓ More Questions", type: "questions" },
              ]);
            });
          });
          break;

        case "methods":
          showTypingIndicator().then(() => {
            addBotMessage([
              "Our therapists use evidence-based treatment methods including:",
              "• Manual therapy techniques",
              "• Therapeutic exercise programs",
              "• Modalities (heat, ice, ultrasound, electrical stimulation)",
              "• Movement retraining",
              "• Ergonomic and postural education",
              "Would you like to know more about how these might help you specifically?",
            ]).then(() => {
              showOptions([
                { text: "📅 Talk to a Therapist", type: "appointment" },
                { text: "🔄 Back to Main Menu", type: "back_to_main" },
              ]);
            });
          });
          break;

        case "specialties":
          showTypingIndicator().then(() => {
            addBotMessage([
              "Our therapists specialize in treating a wide range of conditions including:",
              "• Orthopedic injuries",
              "• Sports medicine",
              "• Post-surgical rehabilitation",
              "• Chronic pain management",
              "• Neurological conditions",
              "• Workplace injuries",
              "What specific condition are you looking to address?",
            ]).then(() => {
              showOptions(BUTTON_OPTIONS.painAreas);
            });
          });
          break;

        case "expect":
          conversationState.currentFlow = "expect";
          handleConversationFlow();
          break;

        case "thanks":
          conversationState.currentFlow = "thanks";
          handleConversationFlow();
          break;

        case "back_to_main":
          showTypingIndicator().then(() => {
            addBotMessage("How else can I help you today?").then(() => {
              showOptions(BUTTON_OPTIONS.main);
            });
          });
          break;

        case "service":
          showServiceCategories();
          break;

        case "service_category":
          showServicesInCategory(option.category);
          break;

        case "service_detail":
          handleServiceMessage(option.service, option.category);
          break;

        default:
          // Default handling for unknown option types
          addBotMessage(
            "I'm not sure how to help with that specific request. Let me show you some options:"
          ).then(() => {
            showOptions(BUTTON_OPTIONS.main);
          });
      }
    }

    // Handle insurance related queries
    function handleInsuranceQuery() {
      showTypingIndicator().then(() => {
        addBotMessage([
          "We accept most major insurance plans including:",
          "• Blue Cross Blue Shield",
          "• Aetna",
          "• UnitedHealthcare",
          "• Cigna",
          "• Medicare",
          "• Workers' Compensation",
          "We offer a free insurance verification before your first visit. Would you like to check your coverage?",
        ]).then(() => {
          showOptions([
            { text: "✅ Verify My Insurance", type: "appointment" },
            { text: "💰 Self-Pay Options", type: "self_pay" },
          ]);
        });
      });
    }

    // Handle cost related queries
    function handleCostQuery() {
      showTypingIndicator().then(() => {
        addBotMessage([
          "With insurance, your cost is typically a copay of $20-$50 per session depending on your plan.",
          "For self-pay patients, we offer competitive rates and package pricing options.",
          "We provide a free cost estimate before starting treatment. Would you like to check your costs?",
        ]).then(() => {
          showOptions([
            { text: "✅ Check My Costs", type: "appointment" },
            { text: "❓ More Questions", type: "questions" },
          ]);
        });
      });
    }

    // Handle therapist qualification queries
    function handleTherapistQuery() {
      showTypingIndicator().then(() => {
        addBotMessage([
          "All our physical therapists are licensed professionals with advanced degrees (DPT or MPT).",
          "Many have additional certifications in specialized areas such as orthopedics, sports, and manual therapy.",
          "Our therapists regularly attend continuing education to stay current with the latest research and techniques.",
          "Would you like to schedule a consultation with one of our experts?",
        ]).then(() => {
          showOptions([
            { text: "📅 Schedule Consultation", type: "appointment" },
            { text: "❓ More Questions", type: "questions" },
          ]);
        });
      });
    }

    // Self-pay options handler
    function handleSelfPayOptions() {
      showTypingIndicator().then(() => {
        addBotMessage([
          "For patients without insurance coverage, we offer:",
          "• Initial evaluation: $120",
          "• Follow-up sessions: $85-$100",
          "• Package discounts available for prepaid sessions",
          "• Payment plans for those who qualify",
          "Would you like to discuss payment options with our staff?",
        ]).then(() => {
          showOptions([
            { text: "📅 Schedule Consultation", type: "appointment" },
            { text: "❓ More Questions", type: "questions" },
          ]);
        });
      });
    }

    // Add this new function to handle service queries
    function handleServiceQuery(detectedServices) {
      if (detectedServices.length === 1) {
        const { service, category } = detectedServices[0];
        
        showTypingIndicator().then(() => {
          const messages = [
            `Let me tell you about our ${service.name} service:`,
            service.description
          ];

          if (service.details) {
            messages.push("This service includes:");
            messages.push(...service.details.map(detail => `• ${detail}`));
          }

          if (service.duration) {
            messages.push(`📅 Typical session duration: ${service.duration}`);
          }

          if (service.frequency) {
            messages.push(`⏰ Recommended frequency: ${service.frequency}`);
          }

          messages.push("Would you like to learn more or schedule an appointment?");

          addBotMessage(messages).then(() => {
            showOptions([
              {
                text: `📅 Schedule ${service.name}`,
                type: "appointment",
                service: service.name
              },
              { text: "❓ Ask More Questions", type: "questions" },
              { text: "🔄 View Other Services", type: "service" }
            ]);
          });
        });
      } else if (detectedServices.length > 1) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "I found multiple services that might interest you. Which one would you like to learn more about?"
          ]).then(() => {
            const serviceButtons = detectedServices.map(({ service, category }) => ({
              text: `${service.icon} ${service.name}`,
              type: "service_detail",
              service: service.name,
              category: category
            }));
            showOptions(serviceButtons);
          });
        });
      }
    }
  }

  // Initialize bot
  initializeChatbot();
});
document.addEventListener("DOMContentLoaded", function () {});
