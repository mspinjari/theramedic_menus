export class AppointmentHandler {
    constructor(messagesContainer) {
        this.messagesContainer = messagesContainer;
        this.appointmentStage = null;
        this.appointmentDetails = {
            name: "",
            phone: "",
            email: "",
            location: "",
            comment: ""  // Add comment field
        };
    }

    startAppointmentScheduling(option = {}) {
        // Hide regular input
        document.querySelector(".pt-chatbot-input").style.display = "none";

        // Clone and show form
        const originalForm = document.getElementById("appointment-form");
        const form = originalForm.cloneNode(true);
        form.style.display = "block";
        this.messagesContainer.appendChild(form);

        // Pre-select location if coming from location selection
        if (option.location && option.preselect) {
            const locationSelect = form.querySelector('[name="location"]');
            locationSelect.value = option.location;
        }

        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        // Form submission handler
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleFormSubmission(form);
        };

        // Cancel button handler
        form.querySelector(".pt-cancel-form").onclick = () => {
            form.remove();
            document.querySelector(".pt-chatbot-input").style.display = "flex";
        };
    }

    validatePhoneNumber(phone) {
        const digits = phone.replace(/\D/g, "");
        return digits.length === 10;
    }

    formatPhoneNumber(phone) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length !== 10) return phone;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(form, fieldName, message) {
        const group = form.querySelector(`[name="${fieldName}"]`).closest(".form-group");
        group.querySelector(".error-message").textContent = message;
        group.querySelector(".error-message").style.display = "block";
        group.querySelector("input, select").style.borderColor = "#dc3545";
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        let isValid = true;

        // Clear previous errors
        form.querySelectorAll(".error-message").forEach(el => el.style.display = "none");
        form.querySelectorAll("input, select").forEach(el => el.style.borderColor = "#ddd");

        // Validate fields
        if (!data.name.trim()) {
            this.showError(form, "name", "Please enter your name");
            isValid = false;
        }

        if (!this.validatePhoneNumber(data.phone)) {
            this.showError(form, "phone", "Please enter a valid 10-digit phone number");
            isValid = false;
        }

        if (!this.validateEmail(data.email)) {
            this.showError(form, "email", "Please enter a valid email address");
            isValid = false;
        }

        if (!data.location) {
            this.showError(form, "location", "Please select a location");
            isValid = false;
        }

        if (isValid) {
            data.phone = this.formatPhoneNumber(data.phone);
            this.submitAppointment(data);
            form.remove();
            document.querySelector(".pt-chatbot-input").style.display = "flex";
            return true;
        }
        return false;
    }

    submitAppointment(details) {
        console.log("Appointment submitted:", details);
        // Show success message with comment if provided
        const successMessage = details.comment 
            ? `Thank you for your appointment request. We've noted your comment: "${details.comment}"`
            : "Thank you for your appointment request.";
        console.log(successMessage);
        // Server submission code here
    }
}
