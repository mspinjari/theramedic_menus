import { AppointmentHandler } from "./appointment.js";
import {
    LOCATIONS,
    SERVICES,
    PAIN_AREAS,
    FAQs,
    SPELLING_CORRECTIONS,
    BUTTON_OPTIONS,
    generatePainAreaButtons
} from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  // Create chatbot HTML structure
  function createChatbotHTML() {
    const chatbotContainer = document.getElementById("pt-chatbot-container");
    if (!chatbotContainer) return;

    // Create the HTML structure
    chatbotContainer.innerHTML = `
<div class="pt-chatbot-wrapper">
  <div class="pt-chatbot" style="display: none;">
    <div class="pt-chatbot-header">
      <h3>PT Clinic Assistance</h3>
      <button class="pt-close-button">&times;</button>
    </div>
    <div class="pt-chatbot-messages"></div>
    <div class="pt-chatbot-input">
      <input type="text" placeholder="Type your message...">
      <button class="pt-send-button"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
  </div>
  <button class="pt-chatbot-toggle"><i class="fa-regular fa-comments"></i></button>
</div>
`;

    // Add end chat modal
    const endChatModal = document.createElement("div");
    endChatModal.className = "end-chat-modal";
    endChatModal.innerHTML = `
<div class="end-chat-content">
    <h3>Do you want to leave current chat?</h3>
    <div class="end-chat-buttons">
        <button id="confirmEndChat" class="pt-send-button">END CHAT</button>
        <button id="cancelEndChat" style="background-color: #ddd">Cancel</button>
    </div>
</div>
`;
    document.body.appendChild(endChatModal);

    // Add typing indicator style
    const style = document.createElement("style");
    style.textContent = `
.typing-indicator {
    display: flex;
    align-items: center;
    margin: 10px 0;
}
.typing-indicator span {
    height: 8px;
    width: 8px;
    float: left;
    margin: 0 1px;
    background-color: #ff6e31;
    display: block;
    border-radius: 50%;
    opacity: 0.4;
}
.typing-indicator span:nth-of-type(1) {
    animation: 1s blink infinite 0.3333s;
}
.typing-indicator span:nth-of-type(2) {
    animation: 1s blink infinite 0.6666s;
}
.typing-indicator span:nth-of-type(3) {
    animation: 1s blink infinite 0.9999s;
}
@keyframes blink {
    50% {
        opacity: 1;
    }
}
`;
    document.head.appendChild(style);

    // Add appointment form template
    const formTemplate = document.createElement("template");
    formTemplate.innerHTML = `
    <form id="appointment-form" class="pt-bot-message" style="display: none;">
        <h4>Schedule Appointment</h4>
        <div class="form-group">
            <label>Full Name:</label>
            <input type="text" name="name" required>
            <div class="error-message"></div>
        </div>
        <div class="form-group">
            <label>Phone Number:</label>
            <input type="tel" name="phone" required>
            <div class="error-message"></div>
        </div>
        <div class="form-group">
            <label>Email:</label>
            <input type="email" name="email" required>
            <div class="error-message"></div>
        </div>
        <div class="form-group">
            <label>Preferred Location:</label>
            <select name="location" required>
                <option value="">Select location</option>
                ${Object.keys(LOCATIONS)
                  .map(
                    (key) =>
                      `<option value="${key}">${LOCATIONS[key].name}</option>`
                  )
                  .join("")}
            </select>
            <div class="error-message"></div>
        </div>
        <div class="form-buttons">
            <button type="submit" class="pt-send-button">Submit</button>
            <button type="button" class="pt-cancel-form">Cancel</button>
        </div>
    </form>
`;
    document.body.appendChild(formTemplate.content);

    // Add form styles
    style.textContent += `
    #appointment-form {
        padding: 15px;
        margin: 10px 0;
    }
    .form-group {
        margin-bottom: 15px;
    }
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    .form-group input, .form-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
    }
    .error-message {
        color: #dc3545;
        font-size: 12px;
        margin-top: 4px;
        display: none;
    }
    .form-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    .pt-cancel-form {
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
    }
`;
    document.head.appendChild(style);

    // Initialize chatbot functionality
    initializeChatbot();
  }

  // Initialize chatbot functionality
  function initializeChatbot() {
    const chatbot = document.querySelector(".pt-chatbot");
    const toggleButton = document.querySelector(".pt-chatbot-toggle");
    const closeButton = document.querySelector(".pt-close-button");
    const sendButton = document.querySelector(".pt-send-button");
    const inputField = document.querySelector(".pt-chatbot-input input");
    const messagesContainer = document.querySelector(".pt-chatbot-messages");

    // Initialize appointment handler
    const appointmentHandler = new AppointmentHandler(messagesContainer);

    // Add conversation state
    let conversationState = {
      currentFlow: null,
      lastPainArea: null,
      formData: {},
    };

    // Toggle chatbot visibility
    toggleButton.addEventListener("click", () => {
      chatbot.style.display = "flex";
      toggleButton.style.display = "none";

      // Add initial greeting if there are no messages
      if (messagesContainer.children.length === 0) {
        const randomGreeting =
          FAQs.greeting[Math.floor(Math.random() * FAQs.greeting.length)];
        showTypingIndicator()
          .then(() => addBotMessage(randomGreeting))
          .then(() => showOptions(BUTTON_OPTIONS.main));
      }
    });

    // Close chatbot
    closeButton.addEventListener("click", () => {
      document.querySelector(".end-chat-modal").style.display = "flex";
    });

    // Add end chat handlers
    document
      .getElementById("cancelEndChat")
      ?.addEventListener(
        "click",
        () => (document.querySelector(".end-chat-modal").style.display = "none")
      );
    document.getElementById("confirmEndChat")?.addEventListener("click", () => {
      chatbot.style.display = "none";
      toggleButton.style.display = "block";
      document.querySelector(".end-chat-modal").style.display = "none";
      clearConversation();
    });

    // Send message
    sendButton.addEventListener("click", sendUserMessage);

    // Send message on Enter key
    inputField.addEventListener("keypress", (e) => {
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

    // Enhanced service detection function
    function detectService(message) {
      const lowerMessage = message.toLowerCase();
      const detectedServices = new Set();

      // Handle general service inquiries
      if (
        /\b(service|treatment|therapy|rehab|help|offer)\b/i.test(lowerMessage)
      ) {
        // Show all services if asking generally
        return [{ type: 'general_inquiry' }];
      }

      // Check for specific services
      Object.entries(SERVICES).forEach(([categoryKey, category]) => {
        Object.entries(category.services).forEach(([serviceKey, service]) => {
          const searchTerms = [
            serviceKey.toLowerCase(),
            service.name.toLowerCase(),
            service.description.toLowerCase(),
            // Add common variations
            service.name.toLowerCase().replace(" therapy", ""),
            service.name.toLowerCase().replace(" rehabilitation", ""),
            ...service.keywords || [] // Add keywords from service config if available
          ];

          if (searchTerms.some(term => lowerMessage.includes(term))) {
            detectedServices.add({ categoryKey, serviceKey, service });
          }
        });
      });

      return Array.from(detectedServices);
    }

    // Handle user message
    function handleUserMessage(message) {
      // Apply spelling correction
      const correctedMessage = correctSpelling(message);
      const lowerMessage = correctedMessage.toLowerCase();

      // Check for services first
      const detectedServices = detectService(correctedMessage);
      if (detectedServices.length > 0) {
        handleServiceMessage(detectedServices);
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
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.services).then(() => {
            showOptions(BUTTON_OPTIONS.services);
          });
        });
      } else if (
        lowerMessage.includes("hour") ||
        lowerMessage.includes("open")
      ) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.hours).then(() => {
            showOptions([
              { text: "📅 Schedule Appointment", type: "appointment" },
              { text: "🔄 Back to Main Menu", type: "back_to_main" }
            ]);
          });
        });
      } else if (
        lowerMessage.includes("insurance") ||
        lowerMessage.includes("pay")
      ) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.insurance).then(() => {
            showOptions([
              { text: "✅ Verify Insurance", type: "appointment" },
              { text: "💰 Self-Pay Options", type: "self_pay" }
            ]);
          });
        });
      } else if (
        lowerMessage.includes("location") ||
        lowerMessage.includes("address") ||
        lowerMessage.includes("where")
      ) {
        showTypingIndicator().then(() => {
          addBotMessage(FAQs.locations).then(() => {
            const locationOptions = Object.entries(LOCATIONS).map(([key, data]) => ({
              text: `📍 ${data.name}`,
              type: "location_details",
              location: key
            }));
            showOptions(locationOptions);
          });
        });
      } else if (
        lowerMessage.includes("appointment") ||
        lowerMessage.includes("schedule") ||
        lowerMessage.includes("book")
      ) {
        startAppointmentScheduling();
      } else if (/(insurance|accept|coverage)/i.test(lowerMessage)) {
        handleInsuranceQuery();
      } else if (
        lowerMessage.includes("cost") ||
        lowerMessage.includes("price") ||
        lowerMessage.includes("fee") ||
        lowerMessage.includes("expensive") ||
        lowerMessage.includes("charges")
      ) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "Our treatment costs vary depending on your insurance coverage:",
            "• With insurance: typically $20-$50 copay per session",
            "• Self-pay rates: $85-$120 per session",
            "• Package discounts available",
            "Would you like to discuss payment options?"
          ]).then(() => {
            showOptions([
              { text: "✅ Check My Coverage", type: "appointment" },
              { text: "💰 Self-Pay Options", type: "self_pay" }
            ]);
          });
        });
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

    // Start appointment scheduling
    function startAppointmentScheduling(option = {}) {
      appointmentHandler.startAppointmentScheduling(option);
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
                  { text: "👩‍⚕️ Our Services", type: "services" },
                  { text: "🧪 Treatment Methods", type: "methods" },
                  { text: "⏰ Treatment Duration", type: "ser" },
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
          if (option.service) {
            let serviceData = null;
            Object.values(SERVICES).forEach((category) => {
              Object.values(category.services).forEach((service) => {
                if (service.name === option.service) {
                  serviceData = service;
                }
              });
            });

            if (serviceData) {
              showTypingIndicator().then(() => {
                addBotMessage([
                  `${serviceData.icon} ${serviceData.name}`,
                  serviceData.description,
                  "Our program includes:",
                  ...serviceData.details.map((detail) => `• ${detail}`),
                  `Sessions typically last ${serviceData.duration}.`,
                  `We recommend ${serviceData.frequency} for optimal results.`,
                  "Would you like to schedule a session or learn more?",
                ]).then(() => {
                  showOptions([
                    {
                      text: `📅 Schedule ${serviceData.name}`,
                      type: "appointment",
                      service: serviceData.name,
                    },
                    { text: "❓ Ask Questions", type: "questions" },
                    { text: "🔄 View Other Services", type: "other_services" },
                  ]);
                });
              });
            }
          } else {
            // New general services overview
            showTypingIndicator().then(() => {
              addBotMessage([
                "Here are our main service categories:",
                "Please select a category to learn more:"
              ]).then(() => {
                showServiceCategories();
              });
            });
          }
          break;

        case "service_info":
          if (option.service) {
            let serviceData = null;
            Object.values(SERVICES).forEach((category) => {
              Object.values(category.services).forEach((service) => {
                if (service.name === option.service) {
                  serviceData = service;
                }
              });
            });

            if (serviceData) {
              showTypingIndicator().then(() => {
                addBotMessage([
                  `More about our ${serviceData.name}:`,
                  "What to expect:",
                  ...serviceData.details.map((detail) => `• ${detail}`),
                  `\nTreatment Schedule:`,
                  `• Duration: ${serviceData.duration}`,
                  `• Frequency: ${serviceData.frequency}`,
                  "\nReady to start your treatment?",
                ]).then(() => {
                  showOptions([
                    {
                      text: "📅 Schedule Now",
                      type: "appointment",
                      service: serviceData.name,
                    },
                    { text: "💰 Insurance Coverage", type: "insurance" },
                    { text: "🔄 Back to Services", type: "other_services" },
                  ]);
                });
              });
            }
          }
          break;

        case "other_services":
          showTypingIndicator().then(() => {
            addBotMessage("Here are our available services:").then(() => {
              const serviceOptions = [];
              Object.values(SERVICES).forEach((category) => {
                Object.values(category.services).forEach((service) => {
                  serviceOptions.push({
                    text: `${service.icon} ${service.name}`,
                    type: "service",
                    service: service.name,
                  });
                });
              });
              showOptions(serviceOptions);
            });
          });
          break;

        case "service_category":
          if (option.category && SERVICES[option.category]) {
            const category = SERVICES[option.category];
            showTypingIndicator().then(() => {
              addBotMessage([
                `${category.title}:`,
                "Select a service to learn more:"
              ]).then(() => {
                const serviceOptions = Object.values(category.services).map(service => ({
                  text: `${service.icon} ${service.name}`,
                  type: "service",
                  service: service.name
                }));
                showOptions([
                  ...serviceOptions,
                  { text: "↩️ Back to Categories", type: "back_to_categories" }
                ]);
              });
            });
          }
          break;

        case "back_to_categories":
          showTypingIndicator().then(() => {
            addBotMessage("Here are our service categories:").then(() => {
              showServiceCategories();
            });
          });
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

    // Improved service message handler
    function handleServiceMessage(detectedServices) {
      if (detectedServices[0]?.type === 'general_inquiry') {
        showTypingIndicator().then(() => {
          addBotMessage([
            "Here are our main service categories:",
            "Please select a category to learn more:"
          ]).then(() => {
            showServiceCategories();
          });
        });
        return;
      }

      if (detectedServices.length === 1) {
        const { service } = detectedServices[0];
        showTypingIndicator().then(() => {
          addBotMessage([
            `${service.icon} ${service.name}`,
            service.description,
            "Would you like to:",
          ]).then(() => {
            showOptions([
              {
                text: `📅 Schedule ${service.name}`,
                type: "appointment",
                service: service.name
              },
              {
                text: `ℹ️ More about ${service.name}`,
                type: "service_info",
                service: service.name
              },
              { text: "👀 View other services", type: "other_services" }
            ]);
          });
        });
      } else if (detectedServices.length > 1) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "I found several services that might help you.",
            "Which one interests you most?"
          ]).then(() => {
            const options = detectedServices.map(({ service }) => ({
              text: `${service.icon} ${service.name}`,
              type: "service",
              service: service.name
            }));
            showOptions(options);
          });
        });
      }
    }

    // Show specific service category
    function showServiceCategory(categoryKey) {
      const category = SERVICES[categoryKey];
      showTypingIndicator().then(() => {
        addBotMessage([
          `${category.title}:`,
          ...Object.values(category.services).map(
            (service) =>
              `${service.icon} ${service.name} - ${service.description}`
          ),
        ]).then(() => {
          const serviceOptions = Object.values(category.services).map(
            (service) => ({
              text: `${service.icon} ${service.name}`,
              type: "service",
              service: service.name,
            })
          );
          showOptions([
            ...serviceOptions,
            { text: "🔄 Back to Services", type: "services" },
          ]);
        });
      });
    }

    // New function to show service categories
    function showServiceCategories() {
      const categoryOptions = Object.entries(SERVICES).map(([key, category]) => ({
        text: `📑 ${category.title}`,
        type: "service_category",
        category: key
      }));
      showOptions([
        ...categoryOptions,
        { text: "📅 Schedule Consultation", type: "appointment" }
      ]);
    }
  }

  // Initialize bot on page load
  createChatbotHTML();
});
