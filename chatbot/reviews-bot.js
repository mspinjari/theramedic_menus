
document.addEventListener('DOMContentLoaded', function () {



    const thera_fab = document.querySelector('.thera_fab');
    const fabContainer = document.querySelector('.thera_fab-container');
    

    // Get all chatbot elements
    const reviewChatbot = document.querySelector('#review-chatbot-container .pt-chatbot');
    const mainChatbot = document.querySelector('#main-chatbot-container .pt-chatbot');
    const reviewMessages = document.querySelector('#review-chatbot-container .pt-chatbot-messages');
    const mainMessages = document.querySelector('#main-chatbot-container .pt-chatbot-messages');
    const mainToggleButton = document.querySelector('#main-chatbot-container .pt-chatbot-toggle');

    thera_fab.addEventListener('click', function () {
        const wasActive = fabContainer.classList.contains('active');

        // Toggle FAB state
        thera_fab.classList.toggle('active');
        fabContainer.classList.toggle('active');

        // If closing the FAB, close all chatbots and reset main chat
        if (wasActive) {
            // Close both chatbots
            reviewChatbot.style.display = 'none';
            mainChatbot.style.display = 'none';

            // Clear all messages
            reviewMessages.innerHTML = '';
            mainMessages.innerHTML = '';

            // Reset main chat toggle button
            mainToggleButton.style.display = 'block';
        }
    });


    // Review locations data
    const REVIEW_LOCATIONS = {
        "STAFFORD": {
            name: "STAFFORD/SUGAR LAND",
            reviews: {
                google: "https://g.page/r/CdVXrRcI3_VFEAI/review",
                yelp: "https://www.yelp.com/biz/theramedic-stafford",
                facebook: "https://www.facebook.com/theramedic.stafford/reviews/"
            }
        },
        "SPRING": {
            name: "SPRING",
            reviews: {
                google: "https://g.page/r/CQpKvnvdgKFPEAI/review",
                yelp: "https://www.yelp.com/biz/theramedic-spring",
                facebook: "https://www.facebook.com/theramedic.spring/reviews/"
            }
        },
        "KATY": {
            name: "KATY",
            reviews: {
                google: "https://g.page/r/CdB20A8WdOBxEAI/review",
                yelp: "https://www.yelp.com/biz/theramedic-katy",
                facebook: "https://www.facebook.com/theramedic.katy/reviews/"
            }
        },
        "SOUTHFIELD": {
            name: "SOUTHEAST, MI",
            reviews: {
                google: "https://g.page/r/CV9kjrUSYnBnEAI/review",
                yelp: "https://www.yelp.com/biz/theramedic-southeast",
                facebook: "https://www.facebook.com/theramedic.southeast/reviews/"
            }
        }
    };

    const reviewLink = document.getElementById('reviewLink');

    reviewLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (reviewChatbot.style.display === 'flex') {
            reviewChatbot.style.display = 'none';
            reviewMessages.innerHTML = '';
        } else {
            reviewChatbot.style.display = 'flex';
            startReviewFlow();
        }
    });

    // Close review chatbot
    const reviewCloseButton = document.querySelector('#review-chatbot-container .pt-close-button');
    reviewCloseButton.addEventListener('click', function () {
        reviewChatbot.style.display = 'none';
        reviewMessages.innerHTML = '';
    });

    function startReviewFlow() {
        reviewMessages.innerHTML = '';

        // First message
        addBotMessage("Hi there, Thank you for visiting us! We hope you had a positive experience with us and we'd love to hear your thoughts. Your feedback helps us improve and also helps others looking for the right care.");

        // Second message
        setTimeout(() => {
            addBotMessage("To get started, please select the location you visited:");
        }, 500);

        // Third message with location buttons
        setTimeout(() => {
            const locationButtons = document.createElement('div');
            locationButtons.className = 'pt-options-container';

            Object.entries(REVIEW_LOCATIONS).forEach(([key, data]) => {
                const button = document.createElement('button');
                button.className = 'pt-option-button';
                button.textContent = data.name;
                button.addEventListener('click', () => {
                    // Add user selection as a message
                    addUserMessage(data.name);
                    showReviewPlatforms(key);
                });
                locationButtons.appendChild(button);
            });

            reviewMessages.appendChild(locationButtons);
        }, 1000);
    }

    function showReviewPlatforms(locationKey) {
        const location = REVIEW_LOCATIONS[locationKey];

        // Clear previous platform buttons if any
        const existingPlatforms = reviewMessages.querySelector('.review-platforms');
        if (existingPlatforms) {
            existingPlatforms.remove();
        }

        // Add bot response with typing effect
        setTimeout(() => {
            addBotMessage(`Thank you for choosing ${location.name}. \n\n We appreciate your feedback! Please select your preferred platform to share your experience:`);

            // Add platform buttons
            const platformContainer = document.createElement('div');
            platformContainer.className = 'pt-options-container review-platforms';

            const platforms = {
                google: {
                    icon: 'http://zystamatic-com.stackstaging.com/theramedicrehab/wp-content/uploads/2025/03/google.png',
                    text: 'Google Review'
                },
                yelp: {
                    icon: 'http://zystamatic-com.stackstaging.com/theramedicrehab/wp-content/uploads/2025/03/yelp.png',
                    text: 'Yelp Review'
                },
                facebook: {
                    icon: 'http://zystamatic-com.stackstaging.com/theramedicrehab/wp-content/uploads/2025/03/facebook.png',
                    text: 'Facebook Review'
                }
            };

            Object.entries(platforms).forEach(([platform, { icon, text }]) => {
                const button = document.createElement('button');
                button.className = 'pt-option-button';
                button.innerHTML = `<img src="${icon}" style="width:20px;height:20px;vertical-align:middle"> ${text}`;
                button.addEventListener('click', () => {
                    // Add user selection as a message
                    addUserMessage(text);
                    // Add final thank you message
                    setTimeout(() => {
                        addBotMessage("Thank you! You'll be redirected to leave your review. Your feedback means a lot to us! 🙏");
                        setTimeout(() => {
                            window.open(location.reviews[platform], '_blank');
                        }, 1000);
                    }, 500);
                });
                platformContainer.appendChild(button);
            });

            reviewMessages.appendChild(platformContainer);
            reviewMessages.scrollTop = reviewMessages.scrollHeight;
        }, 500);
    }

    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'pt-bot-message';
        messageElement.textContent = message;
        reviewMessages.appendChild(messageElement);
        reviewMessages.scrollTop = reviewMessages.scrollHeight;
    }

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'pt-user-message';
        messageElement.textContent = message;
        reviewMessages.appendChild(messageElement);
        reviewMessages.scrollTop = reviewMessages.scrollHeight;
    }


});
