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
  const mainChatbot = document.querySelector(
    "#main-chatbot-container .pt-chatbot"
  );
  const mainMessages = document.querySelector(
    "#main-chatbot-container .pt-chatbot-messages"
  );
  const chatLink = document.getElementById("chatLink");
  const closeButton = document.querySelector(
    "#main-chatbot-container .pt-close-button"
  );
  const sendButton = document.querySelector(
    "#main-chatbot-container .pt-send-button"
  );
  const inputField = document.querySelector(
    "#main-chatbot-container .pt-chatbot-input input"
  );
  const chatbotInputintial = document.querySelector(
    "#main-chatbot-container .pt-chatbot-input"
  );

  // Handle chat link click
  chatLink?.addEventListener("click", function (e) {
    e.preventDefault();
    if (mainChatbot.style.display === "flex") {
      mainChatbot.style.display = "none";
      mainMessages.innerHTML = "";
    } else {
      mainChatbot.style.display = "flex";
      chatbotInputintial.style.display = "flex";
      initializeChatbot();
    }
  });

  // const cancelbutton = document.querySelector(
  //   "#main-chatbot-container .pt-cancel"
  // );
  // cancelbutton?.addEventListener("click", function () {
  //   stopTyping();
  // });
  // Stop typing function
  function stopTyping() {
    // Set flag to stop ongoing typing
    window.typingStopped = true;

    // Clear all intervals in the typing queue
    if (window.typingQueue && window.typingQueue.length > 0) {
      window.typingQueue.forEach((interval) => {
        clearInterval(interval);
      });
      window.typingQueue = [];
    }

    // Clean up any empty message elements that might have been created
    const emptyMessages = document.querySelectorAll(
      ".pt-bot-message:empty, .pt-bot-message:not(:has(*))"
    );
    emptyMessages.forEach((msg) => {
      if (msg.textContent.trim() === "") {
        msg.parentNode.removeChild(msg);
      }
    });
  }
  // Handle close button
  closeButton?.addEventListener("click", function () {
    mainChatbot.style.display = "none";
    mainMessages.innerHTML = "";
    stopTyping();
  });

  

  // Initialize chatbot functionality
  function initializeChatbot() {
    const messagesContainer = mainMessages;

    // Move startInitialChat inside initializeChatbot
    const startInitialChat = () => {
      messagesContainer.innerHTML = "";

      // Chain promises for better performance
      addBotMessage("Welcome to Theramedic Rehab")
        .then(() => addBotMessage("How can I help you today?"))
        .then(() => new Promise((resolve) => setTimeout(resolve, 300)))
        .then(() => showOptions(BUTTON_OPTIONS.main))
        .catch((err) => console.error("Error starting chat:", err));
    };

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
        // Disable input, send button and option buttons while typing
        const inputField = document.querySelector(
          "#main-chatbot-container .pt-chatbot-input input"
        );
        const sendButton = document.querySelector(
          "#main-chatbot-container .pt-send-button"
        );
        const optionButtons = document.querySelectorAll(".pt-option-button");

        if (inputField) inputField.disabled = true;
        if (sendButton) sendButton.disabled = true;
        optionButtons.forEach((btn) => (btn.disabled = true));

        const indicator = document.createElement("div");
        indicator.className = "typing-indicator pt-bot-message";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Remove typing indicator after random time between 1-2 seconds
        setTimeout(() => {
          indicator.remove();
          // Re-enable input, send button and option buttons
          if (inputField) inputField.disabled = false;
          if (sendButton) sendButton.disabled = false;
          optionButtons.forEach((btn) => (btn.disabled = false));
          resolve();
        }, Math.random() * 1000 + 1000);
      });
    }

    // Add bot message with typing effect
    function addBotMessage(message, speed = 23) {
      // Disable input, send button and option buttons while typing
      const inputField = document.querySelector(
        "#main-chatbot-container .pt-chatbot-input input"
      );
      const sendButton = document.querySelector(
        "#main-chatbot-container .pt-send-button"
      );
      const optionButtons = document.querySelectorAll(".pt-option-button");

      if (inputField) inputField.disabled = true;
      if (sendButton) sendButton.disabled = true;
      optionButtons.forEach((btn) => (btn.disabled = true));

      // Store active intervals and message elements for the stopTyping function
      if (!window.typingQueue) {
        window.typingQueue = [];
      }

      // Reset the typing stopped flag when starting new messages
      window.typingStopped = false;

      if (Array.isArray(message)) {
        let chainPromise = Promise.resolve();
        message.forEach((msg) => {
          chainPromise = chainPromise.then(() => {
            return new Promise((resolve) => {
              // Only create message element if not stopped
              if (!window.typingStopped) {
                const messageElement = document.createElement("div");
                messageElement.className = "pt-bot-message";
                messagesContainer.appendChild(messageElement);

                // Type out the message
                typeText(messageElement, msg, speed)
                  .then(resolve)
                  .catch(() => {
                    // If typing was stopped, remove empty message element
                    if (messageElement.textContent.trim() === "") {
                      messagesContainer.removeChild(messageElement);
                    }
                    resolve();
                  });
              } else {
                resolve();
              }
            });
          });
        });
        // Re-enable input, button and option buttons when all messages are done
        return chainPromise.then(() => {
          if (inputField) inputField.disabled = false;
          if (sendButton) sendButton.disabled = false;
          optionButtons.forEach((btn) => (btn.disabled = false));
        });
      } else {
        return new Promise((resolve) => {
          // Only create message element if not stopped
          if (!window.typingStopped) {
            const messageElement = document.createElement("div");
            messageElement.className = "pt-bot-message";
            messagesContainer.appendChild(messageElement);

            // Type out the message and re-enable input when done
            typeText(messageElement, message, speed)
              .then(() => {
                if (inputField) inputField.disabled = false;
                if (sendButton) sendButton.disabled = false;
                optionButtons.forEach((btn) => (btn.disabled = false));
                resolve();
              })
              .catch(() => {
                // If typing was stopped, remove empty message element
                if (messageElement.textContent.trim() === "") {
                  messagesContainer.removeChild(messageElement);
                }
                if (inputField) inputField.disabled = false;
                if (sendButton) sendButton.disabled = false;
                optionButtons.forEach((btn) => (btn.disabled = false));
                resolve();
              });
          } else {
            // Re-enable inputs if we're skipping the message entirely
            if (inputField) inputField.disabled = false;
            if (sendButton) sendButton.disabled = false;
            optionButtons.forEach((btn) => (btn.disabled = false));
            resolve();
          }
        });
      }
    }

    // Type text effect
    function typeText(element, text, speed) {
      return new Promise((resolve, reject) => {
        let i = 0;
        const interval = setInterval(() => {
          // Check if typing should be stopped
          if (window.typingStopped) {
            clearInterval(interval);
            const index = window.typingQueue.indexOf(interval);
            if (index > -1) {
              window.typingQueue.splice(index, 1);
            }
            reject(new Error("Typing stopped"));
            return;
          }

          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else {
            clearInterval(interval);
            const index = window.typingQueue.indexOf(interval);
            if (index > -1) {
              window.typingQueue.splice(index, 1);
            }
            resolve();
          }
        }, speed);

        // Add this interval to the queue
        window.typingQueue.push(interval);
      });
    }
    // function stopTyping() {
    //   // Set flag to stop ongoing typing
    //   window.typingStopped = true;

    //   // Clear all intervals in the typing queue
    //   if (window.typingQueue && window.typingQueue.length > 0) {
    //     window.typingQueue.forEach((interval) => {
    //       clearInterval(interval);
    //     });
    //     window.typingQueue = [];
    //   }
    // }

    // Add user message to chat
    function addUserMessage(message) {
      const messageElement = document.createElement("div");
      messageElement.className = "pt-user-message";
      messageElement.textContent = message;
      messagesContainer.appendChild(messageElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function correctSpelling(text) {
      let correctedText = text.toLowerCase(); // Convert input text to lowercase once

      // Apply spelling corrections
      for (const correctedPhrase in SPELLING_CORRECTIONS) {
        const variations = SPELLING_CORRECTIONS[correctedPhrase];

        if (Array.isArray(variations)) {
          // Handle array of variations
          variations.forEach((variation) => {
            const regex = new RegExp(`\\b${variation}\\b`, "gi");
            correctedText = correctedText.replace(regex, correctedPhrase);
          });
        } else {
          // Handle single string correction (original logic)
          const regex = new RegExp(`\\b${correctedPhrase}\\b`, "gi"); // use correctedPhrase as misspelled to match keys.
          correctedText = correctedText.replace(regex, variations); // variations here is the single corrected string
        }
      }

      return correctedText;
    }
    // Optimized pain detection function
    function detectPainAreas(message) {
      const lowerMessage = message.toLowerCase();
      const detectedAreas = new Set();

      // Combined regex for pain-related terms
      const painPattern =
        /\b(?:pain|ache|hurt|sore|stiff|discomfort|experience|treat)\b/i;

      // Create a single regex pattern for all conditions
      const painAreaPatterns = {
        head_pain: /\b(?:headache|migraine|tmj|jaw|temple|head)\b/i,
        shoulder_pain:
          /\b(?:rotator\s*cuff|frozen\s*shoulder|impingement|shoulder|deltoid|scapula|bursitis)\b/i,
        back_pain:
          /\b(?:sciatica|lumbar|spine|spinal|(?:lower|upper|mid)\s*back|back|herniated|disc|pinched\s*nerve|slipped\s*disc|bulging\s*disc|stenosis|scoliosis)\b/i,
        neck_pain: /\b(?:whiplash|cervical|tech\s*neck|neck)\b/i,
        hand_wrist_pain: /\b(?:carpal|tunnel|wrist|finger|thumb|hand|palm)\b/i,
        foot_ankle_pain: /\b(?:heel|plantar|fasciitis|arch|ankle|foot|toe)\b/i,
        knee_pain: /\b(?:acl|mcl|meniscus|patella|runner|knee)\b/i,
        hip_pain: /\b(?:bursitis|arthritis|groin|hip)\b/i,
        elbow_pain: /\b(?:tennis\s*elbow|golfer|tendonitis|elbow)\b/i,
        pelvic_floor: /\b(?:incontinence|bladder|prolapse|pelvic|floor)\b/i,
      };

      // Test message against patterns
      if (painPattern.test(lowerMessage)) {
        // If general pain is mentioned, check specific areas
        Object.entries(painAreaPatterns).forEach(([key, pattern]) => {
          if (pattern.test(lowerMessage)) {
            detectedAreas.add({ key, data: PAIN_AREAS[key] });
          }
        });
      } else {
        // Even if pain is not explicitly mentioned, check for specific conditions
        Object.entries(painAreaPatterns).forEach(([key, pattern]) => {
          if (pattern.test(lowerMessage)) {
            detectedAreas.add({ key, data: PAIN_AREAS[key] });
          }
        });
      }

      return Array.from(detectedAreas);
    }
    // Optimized service detection function
    function detectServices(message) {
      const lowerMessage = message.toLowerCase();
      const detectedServices = new Set();

      // Create a map of normalized terms to service info
      const serviceTermMap = new Map();

      Object.entries(SERVICES).forEach(([category, categoryData]) => {
        Object.entries(categoryData.services).forEach(([key, service]) => {
          // Add service name
          serviceTermMap.set(service.name.toLowerCase(), {
            key,
            service,
            category,
          });

          // Add keywords if they exist
          if (service.keywords) {
            service.keywords.forEach((keyword) => {
              serviceTermMap.set(keyword.toLowerCase(), {
                key,
                service,
                category,
              });
            });
          }
        });
      });

      // Check message against service terms
      serviceTermMap.forEach((serviceInfo, term) => {
        if (lowerMessage.includes(term)) {
          detectedServices.add(serviceInfo);
        }
      });

      return Array.from(detectedServices);
    }

    // Modify handleUserMessage function - add this case before the pain detection
    function handleUserMessage(message) {
      const correctedMessage = correctSpelling(message);
      const lowerMessage = correctedMessage.toLowerCase();

      // Check for services mentions first
      const detectedServices = detectServices(lowerMessage);
      if (detectedServices.length > 0 && !appointmentStage) {
        handleServiceQuery(detectedServices);
        return;
      }
      // Check for pain mentions seconds
      const detectedPainAreas = detectPainAreas(lowerMessage);
      if (detectedPainAreas.length > 0 && !appointmentStage) {
        handlePainMessage(detectedPainAreas);
        return;
      }

      // Enhanced FAQ matching function
      function matchMultipleFAQs(message) {
        const matchedFAQs = [];
        const lowerMessage = message.toLowerCase();
        const matchingRules = [
          {
            key: "treatmentPlan",
            regex:
              /(?:(?:plan|details|detials|deetails|process)\s*(?:of|for)\s*(?:treatment|therapy|therpy|tretment))|(?:treatment|therapy|therpy|tretment)\s*(?:plan|approach|detials|details|deetails|process)|what.*(?:included|involves|in|is)|treatment\s*process\s*details/i,
          },
          {
            key: "paymentPlans",
            regex:
              /(?:pay?ment\s*plan|fin?anc?(?:e|ing|ial)|pay|pack?age|cost\s*opt?ion|pyament|payement|plan|finance)/i,
          },
          {
            key: "costQuery",
            regex:
              /\b(?:cost|price|fee|how\s+much|charge|session|visit|therapy|treatment|therpy|tretment)\b.*(?:cost|price|fee|charge|estimate|detail|information|query|be|will)|(?:cost|price|fee|charge)(?:\s+(?:of|for|per))?\b|(?:charges?|charging|cost(?:ing)?|pric(?:ing|e)|fee(?:s)?)\b/i,
          },
          {
            key: "insuranceQuery",
            regex:
              /(?:insur(?:ance)?|covere?d|coverage|accept|pay|pays?|insurence|insureance|(?:do\s*you\s*)?accept\s*insurance|blue\s*cross\s*blue\s*shield\s*(?:of\s*texas)?|aetna|united\s*healthcare|cigna|community\s*health\s*choice|molina\s*healthcare|ambetter\s*(?:from\s*superior\s*healthplan)?|oscar\s*health|humana|medicare|medicaid)/i,
          },
          {
            key: "genericAppointment",
            regex:
              /(?:book|sched?ule|appoint?ment|apoint?ment|visit|booking|appointement|reservation)/i,
          },
          {
            key: "sessionLength",
            regex:
              /(?:how\s*long|length|duration|time|timing|typical)\s*(?:is|for|of|are|will\s*be)?\s*(?:a|the|your|my)?\s*(?:session|appointment|visit|treatment|therapy|consultation)|(?:session|appointment|visit)\s*(?:length|duration|time)/i,
          },
          {
            key: "conditionsTreated",
            regex:
              /(?:what|which)?\s*(?:(?:problems?|conditions?|services?|therap(?:y|ies)|treatments?|specialt(?:y|ies)|expertise|areas?)\s*(?:do\s*you|you\s*(?:guys?)?)?\s*(?:help|treat|handle|fix|work\s*with|speciali[sz]e\s*in|offer|provide|perform|do|available)|(?:what\s*(?:kind|type)\s*of\s*(?:therapy|treatment|service))|(?:what\s*do\s*you\s*(?:do|offer|provide|perform)(?:\s*for\s*(?:patients?|clients?|people))?)|service\s*offerings?)/i,
          },
          {
            key: "startTreatment",
            regex:
              /(?:how\s*soon|when|start|begin|commense|comence)\s*(?:treatment|therapy|therpy|tretment)/i,
          },
          {
            key: "firstAppointment",
            regex:
              /(?:first|initial|1st)\s*(?:appointment|appointement|visit|session)|what\s*(?:bring|need|require)/i,
          },
          {
            key: "referral",
            regex:
              /\b(?:re+f+e+r+a+l+|re+qu+i+re+d+|dr|docto?r|refferal|referal)\b/i,
          },
          {
            key: "insurance",
            regex:
              /(insurance|insur|covered|accept|coverage|benefit|provider|network|insurence|insureance|blue\s*cross\s*blue\s*shield\s*(?:of\s*texas)?|aetna|united\s*healthcare|cigna|community\s*health\s*choice|molina\s*healthcare|ambetter\s*(?:from\s*superior\s*healthplan)?|oscar\s*health|humana|medicare|medicaid|(?:do\s*you\s*)?accept\s*insurance)/i,
          },
          {
            key: "therapist",
            regex:
              /(therapist.*experience|experience.*therapist|certified|qualified|expert|specialist|training|education|license|credential|degree|qualifications|therepist|physio|background)/i,
          },
          {
            key: "CancellationAppointmentPolicy",
            regex:
              /(?:cancel|cancle|cancell?|reschedule|change|modify|update|postpone)\s*(?:my|an|the|this|that|scheduled|booked)?\s*(?:appointment|appointement|session|visit|booking|schedule|time|slot)|(?:how\s*(?:to|do|can|should|would))?\s*(?:cancel|cancle|cancell?|reschedule|change|modify|update|postpone)\s*(?:my|an|the|this|that|scheduled|booked)?\s*(?:appointment|appointement|session|visit|booking|schedule|time|slot)|(?:cancellation|cancelation|rescheduling)\s*(?:policy|procedure|process|fee|charge)|(?:reschedule|cancel|change)\b/i,
          },
          {
            key: "parking",
            regex:
              /(?:parking|park|where\s*to\s*park|parking\s*available|car\s*park)/i,
          },
          {
            key: "services",
            regex:
              /(?:what|which)?\s*(?:services?|therapy|treatments?|specialt(?:y|ies)|expertise|areas?)?\s*(?:do\s*you|you\s*guys?)?\s*(?:offer|provide|perform|do|available|speciali[sz]e\s*in)|(?:what\s*(?:kind\s*of|type\s*of)?\s*(?:therapy|treatment|service))|(?:what\s*(?:do\s*you\s*(?:do|offer|provide|perform)(?:\s*for\s*(?:patients?|clients?|people))?))|\b(?:service\s*offerings?)\b/i,
          },
          {
            key: "hours",
            regex:
              /(?:hour|time|open|close|when.*open|operating|business\s*hour)/i,
          },
          {
            key: "locations",
            regex:
              /(?:location|address|where|direction|place|facility|clinic)/i,
          },
        ];

        matchingRules.forEach((rule) => {
          if (rule.regex.test(message)) {
            matchedFAQs.push(rule.key);
          }
        });

        return matchedFAQs;
      }

      // Check for multiple FAQ matches
      const matchedFAQs = matchMultipleFAQs(correctedMessage);
      if (matchedFAQs.length > 0) {
        const faqLabels = {
          treatmentPlan: "📋 Treatment Plan Details",
          paymentPlans: "💰 Payment/Financing Options",
          costQuery: "💲 Cost/Pricing Info",
          insuranceQuery: "🏥 Insurance Coverage",
          genericAppointment: "📆 Booking an Appointment",
          sessionLength: "⏱️ Session Duration",
          conditionsTreated: "🩺 Conditions We Treat",
          startTreatment: "🚀 Starting Treatment",
          firstAppointment: "🆕 About First Appointments",
          referral: "👨‍⚕️ Referral Information",
          insurance: "🏥 Insurance Information",
          therapist: "👨‍⚕️ Our Therapists",
          CancellationAppointmentPolicy: "❌ Cancellation Policy",
          parking: "🅿️ Parking Information",
          services: "🏥 Our Services",
          hours: "⏰ Business Hours",
          locations: "📍 Clinic Locations",
        };

        if (matchedFAQs.length === 1) {
          showTypingIndicator().then(() => {
            const matchedKey = matchedFAQs[0];
            if (matchedKey === "insurance") {
              handleInsuranceQuery();
            }

            // else if (matchedKey === "cost") {
            //   handleCostQuery();
            // }
            else if (matchedKey === "hours") {
              addBotMessage(FAQs.hours);
            } else if (matchedKey === "CancellationAppointmentPolicy") {
              addBotMessage(FAQs.CancellationAppointmentPolicy);
            } else if (matchedKey === "therapist") {
              handleTherapistQuery();
            } else if (matchedKey === "services") {
              showServiceCategories();
            } else if (matchedKey === "locations") {
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
            } else {
              addBotMessage(FAQs[matchedKey]).then(() => {
                // startAppointmentScheduling();
                showOptions([
                  { text: "📅 Yes, schedule now", type: "appointment" },
                  { text: "📞 I have more questions", type: "questions" },
                ]);
              });
            }
          });
          return;
        }

        showTypingIndicator().then(() => {
          addBotMessage([
            "I found multiple relevant topics.",
            "Which would you like to know more about?",
          ]).then(() => {
            showOptions(
              matchedFAQs.map((faqKey) => ({
                text: faqLabels[faqKey],
                type: "faq",
                faq: faqKey,
              }))
            );
          });
        });
        return;
      }

      if (lowerMessage.includes("arthritis")) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "Arthritis can affect various joints. To assist you best, could you tell me where you are experiencing arthritis pain?",
            "Please select the area that's most affected:",
          ]).then(() => {
            showOptions(generatePainAreaButtons());
          });
        });
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
      } else if (
        /(pain|hurt|ache|sore|discomfort|stiff|tight|tender|numb|tingling|burning|sharp|dull|chronic|suffer|experience)/i.test(
          lowerMessage
        )
      ) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "What type of pain are you experiencing?",
            "We treat many conditions and can help identify the best treatment approach.",
          ]).then(() => {
            showOptions(BUTTON_OPTIONS.painAreas);
          });
        });
      }
      // else {
      //   handleRandomInput();
      // }
      else {
        handleRandomInput(correctedMessage); // Pass the corrected message
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
              { text: "⚙️ Explore our services", type: "service" },
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
      // if (!service) return handleRandomInput();
      if (!service) return handleRandomInput(correctedMessage);

      showTypingIndicator().then(() => {
        const messages = [
          `Our ${service.name} service includes:`,
          service.description,
        ];

        if (service.details) {
          messages.push("We provide:");
          messages.push(...service.details.map((detail) => `• ${detail}`));
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
            { text: "🔄 View Other Services", type: "service" },
          ]);
        });
      });
    }

    // Show service categories
    function showServiceCategories() {
      showTypingIndicator().then(() => {
        addBotMessage("What type of service are you interested in?").then(
          () => {
            const serviceButtons = Object.entries(SERVICES).map(
              ([category, data]) => ({
                text: `${data.title}`,
                type: "service_category",
                category: category,
              })
            );
            showOptions(serviceButtons);
          }
        );
      });
    }

    // Show services in a category
    function showServicesInCategory(category) {
      const categoryData = SERVICES[category];
      // if (!categoryData) return handleRandomInput();
      if (!categoryData) return handleRandomInput(correctedMessage);

      showTypingIndicator().then(() => {
        addBotMessage(`Here are our ${categoryData.title}:`).then(() => {
          const serviceButtons = Object.entries(categoryData.services).map(
            ([key, service]) => ({
              text: `${service.icon} ${service.name}`,
              type: "service_detail",
              service: key,
              category: category,
            })
          );
          showOptions([
            ...serviceButtons,
            { text: "↩️ Back to Categories", type: "service" },
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
      const chatbotInput = document.querySelector(
        "#main-chatbot-container .pt-chatbot-input"
      );
      const template = document.querySelector("#appointment-form-template");
      const originalForm = template.content.querySelector("#appointment-form");

      // Hide regular input
      if (chatbotInput) {
        chatbotInput.style.display = "none";
      }

      // Add message before showing form
      // showTypingIndicator().then(() => {
      // addBotMessage("Help Us Get to Know You, so that our team can contact you").then(() => {
      // Clone and show form
      const form = originalForm.cloneNode(true);
      form.style.display = "block";

      // Add locations to select
      const locationSelect = form.querySelector('select[name="location"]');
      Object.entries(LOCATIONS).forEach(([key, data]) => {
        const option = document.createElement("option");
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
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleFormSubmission(form);
      });

      // Cancel button handler
      form.querySelector(".pt-cancel-form").addEventListener("click", () => {
        form.remove();
        if (chatbotInput) {
          chatbotInput.style.display = "flex";
        }
      });
      // });
      // });
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

      const messages = [
        "🎉 Appointment Request Received!",
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${
          data.email.length > 20
            ? data.email
                .split("")
                .reduce((acc, char, index) => {
                  if (index > 0 && index % 20 === 0) {
                    acc.push("\n       " + char);
                  } else if (index === 0) {
                    acc.push(char);
                  } else {
                    acc[acc.length - 1] += char;
                  }
                  return acc;
                }, [])
                .join("")
            : data.email
        }`,
        `Location: ${location.name}`,
      ];

      // Only add comment to messages if it exists and is not empty
      if (data.comment && data.comment.trim()) {
        messages.push(`Comments: ${data.comment}`);
      }

      messages.push(
        "Our team will contact you within 24 hours to confirm your appointment.",
        "Thank you for choosing Theramedic Rehab!"
      );

      showTypingIndicator().then(() => {
        addBotMessage(messages).then(() => {
          showOptions([
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
    function handleRandomInput(message) {
      // Add message parameter
      // Use the passed message instead of inputField.value
      const lowerMessage = message.toLowerCase();

      const greetings = [
        /\b(?:h(?:i|ello|ey)|good\s*(?:morning|afternoon|evening))\b/i,
        /\b(?:help|assist(?:ance)?)\b/i,
        /\b(?:what\s*(?:can|do)\s*you\s*(?:do|for)|your\s*purpose)\b/i,
      ];

      if (greetings.some((pattern) => pattern.test(lowerMessage))) {
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
          "I didn't quite get that. Please fill out the below form, our team will get back to you soon!",
        ]).then(() => {
          // showOptions(BUTTON_OPTIONS.main);
          startAppointmentScheduling();
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
              "15 mins free consultation",
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
                  { text: "❔ Other Queries", type: "appointment" },
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
              "We'll verify your benefits before your first appointment and explain any potential costs.",
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
              // showOptions([
              //   { text: "📅 Talk to a Therapist", type: "appointment" },
              //   { text: "🔄 Back to Main Menu", type: "back_to_main" },
              // ]);
              showOptions([
                { text: "📅 Schedule First Visit", type: "appointment" },
                { text: "❓ More Questions", type: "questions" },
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

        // case "self_pay":
        //   handleSelfPayOptions();
        //   break;

        case "faq":
          showTypingIndicator().then(() => {
            addBotMessage(FAQs[option.faq]).then(() => {
              startAppointmentScheduling();
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
    // function handleInsuranceQuery() {
    //   showTypingIndicator().then(() => {
    //     addBotMessage([
    //       "We accept most major insurance plans including:",
    //       "• Blue Cross Blue Shield",
    //       "• Aetna",
    //       "• UnitedHealthcare",
    //       "• Cigna",
    //       "• Medicare",
    //       "• Workers' Compensation",
    //       "We offer a free insurance verification before your first visit. Would you like to check your coverage?",
    //     ]).then(() => {
    //       showOptions([
    //         { text: "✅ Verify My Insurance", type: "appointment" },
    //         { text: "💰 Self-Pay Options", type: "self_pay" },
    //       ]);
    //     });
    //   });
    // }

    // // Handle cost related queries
    // function handleCostQuery() {
    //   showTypingIndicator().then(() => {
    //     addBotMessage([
    //       "With insurance, your cost is typically as per session depending on your plan.",
    //       "For self-pay patients, we offer competitive rates and package pricing options.",
    //       "We provide a free cost estimate before starting treatment. Would you like to check your costs?",
    //     ]).then(() => {
    //       showOptions([
    //         { text: "✅ Check My Costs", type: "appointment" },
    //         { text: "❓ More Questions", type: "questions" },
    //       ]);
    //     });
    //   });
    // }

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

    // // Self-pay options handler
    // function handleSelfPayOptions() {
    //   showTypingIndicator().then(() => {
    //     addBotMessage([
    //       "For patients without insurance coverage, we offer:",
    //       "• Initial evaluation: $120",
    //       "• Follow-up sessions: $85-$100",
    //       "• Package discounts available for prepaid sessions",
    //       "• Payment plans for those who qualify",
    //       "Would you like to discuss payment options with our staff?",
    //     ]).then(() => {
    //       showOptions([
    //         { text: "📅 Schedule Consultation", type: "appointment" },
    //         { text: "❓ More Questions", type: "questions" },
    //       ]);
    //     });
    //   });
    // }

    // Add this new function to handle service queries
    function handleServiceQuery(detectedServices) {
      if (detectedServices.length === 1) {
        const { key, service, category } = detectedServices[0];

        showTypingIndicator().then(() => {
          const messages = [
            `Let me tell you about our ${service.name} service:`,
            service.description,
          ];

          if (service.details) {
            messages.push("This service includes:");
            messages.push(...service.details.map((detail) => `• ${detail}`));
          }

          if (service.duration) {
            messages.push(`📅 Typical session duration: ${service.duration}`);
          }

          if (service.frequency) {
            messages.push(`⏰ Recommended frequency: ${service.frequency}`);
          }

          messages.push(
            "Would you like to learn more or schedule an appointment?"
          );

          addBotMessage(messages).then(() => {
            showOptions([
              {
                text: `📅 Schedule ${service.name}`,
                type: "appointment",
                service: key,
                category: category,
              },
              {
                text: "❓ Ask More Questions",
                type: "questions",
              },
              {
                text: "🔄 View Other Services",
                type: "service_category",
                category: category,
              },
            ]);
          });
        });
      } else if (detectedServices.length > 1) {
        showTypingIndicator().then(() => {
          addBotMessage([
            "I found multiple services that might interest you. Which one would you like to learn more about?",
          ]).then(() => {
            const serviceButtons = detectedServices.map(
              ({ key, service, category }) => ({
                text: `${service.icon || "🔹"} ${service.name}`,
                type: "service_detail",
                service: key,
                category: category,
              })
            );

            // Add a view all services option
            serviceButtons.push({
              text: "🔄 View All Services",
              type: "service",
            });

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
