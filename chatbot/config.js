export const LOCATIONS = {
  STAFFORD: {
    name: "STAFFORD/SUGAR LAND",
    address: "12603 Southwest Fwy Ste 101, Stafford, TX 77477",
    zip: "77477",
  },
  SPRING: {
    name: "SPRING",
    address: "17320 Red Oak Dr, Ste 102, Houston, TX 77090",
    zip: "77090",
  },
  KATY: {
    name: "KATY",
    address: "24217 Kingsland Blvd, Katy, TX 77494",
    zip: "77494",
  },
  SOUTHFIELD: {
    name: "SOUTHFIELD",
    address: "26400 W 12 Mile Rd Ste 25, Southfield, MI 48034",
    zip: "48034",
  },
};

export const SERVICES = {
  therapy: {
    title: "Therapy Services",
    services: {
      physical: {
        name: "Physical Therapy",
        icon: "🏃‍♂️",
        description:
          "Comprehensive physical rehabilitation for various conditions and injuries.",
        keywords: ["pt", "physiotherapy", "physical rehab", "physio", "rehabilitation"],
        details: [
          "Personalized treatment plans",
          "Manual therapy techniques",
          "Therapeutic exercises",
          "Pain management",
          "Functional training"
        ],
        duration: "45-60 minutes",
        frequency: "2-3 sessions per week"
      },
      occupational: {
        name: "Occupational Therapy",
        icon: "🔧",
        description: "Help with daily activities and workplace ergonomics.",
      },
      aquatic: {
        name: "Aquatic Therapy",
        icon: "🏊‍♂️",
        description: "Water-based therapy for gentle rehabilitation.",
      },
      speech: {
        name: "Speech Language Therapy",
        icon: "🗣️",
        description: "Communication and swallowing disorder treatment.",
      },
      pediatric: {
        name: "Pediatric Therapy",
        icon: "👶",
        description: "Specialized therapy services for children.",
      },
      telerehab: {
        name: "Tele-Rehab",
        icon: "💻",
        description: "Remote therapy sessions via video conferencing.",
      },
    },
  },
  recovery: {
    title: "Recovery Services",
    services: {
      auto: {
        name: "Auto Accident Injury Rehab",
        icon: "🚗",
        description:
          "Specialized rehabilitation for accident-related injuries.",
      },
      sports: {
        name: "Sport Injuries",
        icon: "⚽",
        description:
          "Recovery programs for athletes and sports-related injuries.",
      },
      cognitive: {
        name: "Cognitive Rehab",
        icon: "🧠",
        description: "Therapy for cognitive function improvement.",
      },
      worker: {
        name: "Worker Injury",
        icon: "⚒️",
        description: "Work-related injury rehabilitation programs.",
      },
      vestibular: {
        name: "Vestibular Rehab",
        icon: "🌀",
        description: "Treatment for balance and dizziness disorders.",
      },
      fce: {
        name: "Functional Capacity Evaluation (FCE)",
        icon: "📊",
        description: "Comprehensive assessment of physical abilities.",
      },
      stroke: {
        name: "Stroke Rehab",
        icon: "🫀",
        description: "Rehabilitation programs for stroke recovery.",
      },
    },
  },
};

export const PAIN_AREAS = {
  head_pain: {
    display: "Head Pain",
    icon: "🧠",
    treatments: ["Manual therapy", "Exercise therapy", "Posture correction"],
    description:
      "Our specialists address headaches, migraines, and TMJ disorders with targeted treatments.",
  },
  shoulder_pain: {
    display: "Shoulder Pain",
    icon: "💪",
    treatments: [
      "Manual therapy",
      "Strengthening exercises",
      "Stretching",
      "Posture correction",
      "Joint mobilization",
    ],
    description:
      "We provide targeted treatments for rotator cuff injuries, frozen shoulder, and other shoulder-related conditions to improve mobility and reduce pain.",
  },
  back_pain: {
    display: "Back Pain",
    icon: "⬆️",
    treatments: [
      "Spinal mobilization",
      "Core strengthening",
      "Postural education",
    ],
    description:
      "Our comprehensive approach targets both relief and prevention of recurring back pain.",
  },
  neck_pain: {
    display: "Neck Pain",
    icon: "↕️",
    treatments: [
      "Manual therapy",
      "Therapeutic exercise",
      "Ergonomic training",
    ],
    description:
      "We address pain from tech neck, whiplash, and chronic conditions with specialized care.",
  },
  hip_pain: {
    display: "Hip Pain",
    icon: "🦵",
    treatments: ["Joint mobilization", "Strengthening", "Movement retraining"],
    description:
      "Our therapists specialize in improving mobility and reducing hip discomfort.",
  },
  elbow_pain: {
    display: "Elbow Pain",
    icon: "💪",
    treatments: [
      "Manual therapy",
      "Eccentric training",
      "Activity modification",
    ],
    description:
      "We provide effective treatment for tennis elbow, golfer's elbow and other conditions.",
  },
  pelvic_floor: {
    display: "Pelvic Floor",
    icon: "⚠️",
    treatments: ["Muscle retraining", "Biofeedback", "Behavioral strategies"],
    description:
      "Our specialized therapists address pelvic pain and dysfunction with expert care.",
  },
  hand_wrist_pain: {
    display: "Hand/Wrist Pain",
    icon: "✋",
    treatments: ["Joint mobilization", "Nerve gliding", "Therapeutic exercise"],
    description:
      "We treat carpal tunnel, arthritis, and post-surgical conditions of the hand and wrist.",
  },
  knee_pain: {
    display: "Knee Pain",
    icon: "🦿",
    treatments: ["Joint mobilization", "Strengthening", "Movement retraining"],
    description:
      "Our therapists address injuries, arthritis, and post-surgical recovery with specialized care.",
  },
  foot_ankle_pain: {
    display: "Foot/Ankle Pain",
    icon: "👣",
    treatments: ["Joint mobilization", "Balance training", "Gait analysis"],
    description:
      "We provide effective treatment for plantar fasciitis, sprains, and chronic instability.",
  },
};

export const FAQs = {
  greeting: [
    "Hi there! I'm your Theramedic Rehab! assistant.\nHow can I help you feel better today?",
    "Welcome to our Theramedic Rehab! What brings you in today?",
  ],
  // services: [
  //   "We offer comprehensive rehabilitation services including:",
  //   "Therapy Services:",
  //   "🏃‍♂️ Physical Therapy",
  //   "🔧 Occupational Therapy",
  //   "🏊‍♂️ Aquatic Therapy",
  //   "🗣️ Speech Language Therapy",
  //   "👶 Pediatric Therapy",
  //   "💻 Tele-Rehab",
  //   // "",
  //   "Recovery Services:",
  //   "🚗 Auto Accident Injury Rehab",
  //   "⚽ Sport Injuries",
  //   "🧠 Cognitive Rehab",
  //   "⚒️ Worker Injury",
  //   "🌀 Vestibular Rehab",
  //   "📊 Functional Capacity Evaluation",
  //   "🫀 Stroke Rehab",
  //   // "",
  //   "Would you like to learn more about any specific service?",
  // ],
  hours: [
    "⏰ We're here for you:",
    "Monday-Friday: 9:00 AM - 6:00 PM",
    "Weekends: Closed",
  ],
  insurance: [
    "We accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, Cigna, and Medicare.",
    "To check your coverage, I'll need a few quick details.",
  ],
  locations: [
    "We have 4 convenient locations to serve you:",
    "🏢 STAFFORD/SUGAR LAND: 12603 Southwest Fwy, TX 77477",
    "🏢 SPRING: 17320 Red Oak Dr, TX 77090",
    "🏢 KATY: 24217 Kingsland Blvd, TX 77494",
    "🏢 SOUTHFIELD: 26400 W 12 Mile Rd, MI 48034",
    "Which is most convenient for you?",
  ],
  painResponse: [
    "We specialize in treating your specific condition. Our therapists have extensive experience with this type of pain.",
    "Let's schedule you with the right specialist who can help you get relief quickly.",
  ],
  insuranceQuery: [
    "Thanks for asking! Insurance coverage can vary based on your plan and location. To provide accurate details, please share your information via the form below, our team will contact you shortly so we can assist you faster.",
  ],
  treatmentPlan: [
    "Great question! Treatment plans are personalized to meet your unique needs and goals. To help us design the best approach for you, kindly share your details here, Our team will review your case and reach out with tailored recommendations!",
  ],
  paymentPlans: [
    "We appreciate you asking! We provide flexible options to suit different needs, and our team will gladly share details based on your situation. For a quick response, please fill out this short form:",
  ],
  costQuery: [
    "Costs can vary depending on your treatment plan and insurance coverage. To give you a clear estimate, we'll need a few details about your needs. Share your info here, and our team will contact you shortly.",
  ],
  genericAppointment: [
    "Thanks for your interest! To streamline your experience, please share your details via our form. Our team will review your request and contact you.",
  ],
};

export const SPELLING_CORRECTIONS = {
  // General corrections
  // "physio": "physical therapy",
  // "physioterapy": "physical therapy",
  // "fisiotherapy": "physical therapy",
  // "fisiotherapi": "physical therapy",
  // "physiotherapy": "physical therapy",
  // "therapy": "physical therapy",
  // "therapist": "physical therapist",
  appointment: "appointment",
  appoitment: "appointment",
  apointment: "appointment",
  apoinment: "appointment",
  schedual: "schedule",
  shedule: "schedule",
  scedule: "schedule",
  scehdule: "schedule",
  services: "service",
  servis: "service",
  servise: "service",
  servicies: "service",
  theropy: "therapy",
  therapi: "therapy",
  terapy: "therapy",
  therapy: "therapy",
  physical: "physical therapy",
  phisical: "physical therapy",
  physio: "physical therapy",
  physioterapy: "physical therapy",
  ocupational: "occupational therapy",
  ocupationel: "occupational therapy",
  occupationl: "occupational therapy",
  speach: "speech therapy",
  speec: "speech therapy",
  speetch: "speech therapy",
  aqua: "aquatic therapy",
  aquatherapy: "aquatic therapy",
  aquarehab: "aquatic therapy",
  pediatrik: "pediatric therapy",
  pediatrik: "pediatric therapy",
  insuranse: "insurance",
  insurence: "insurance",
  insurnce: "insurance",
  offise: "office",
  ofise: "office",
  ofice: "office",
  locatoin: "location",
  lokation: "location",
  addres: "address",
  time: "hours",
  working: "hours",
  "local visit": "hours",
  tim: "hours",
  clock: "hours",
  tame: "hours",
  tam: "hours",

  // Head Pain corrections
  headake: "head pain",
  migraines: "head pain",
  migrane: "head pain",
  "hed pain": "head pain",
  hedache: "head pain",

  // Shoulder Pain corrections
  shoulder: "shoulder",
  shouder: "shoulder",
  sholder: "shoulder",
  shouldr: "shoulder",
  shouldar: "shoulder",
  sholuder: "shoulder",
  "shoulder pain": "shoulder pain",
  "shouder pain": "shoulder pain",
  "sholder pain": "shoulder pain",
  "shouldr pain": "shoulder pain",
  "shouldar pain": "shoulder pain",
  "sholuder pain": "shoulder pain",
  "shoulder ache": "shoulder pain",
  "shouder ache": "shoulder pain",
  "shoulder treatment": "shoulder treatment",
  "shouder treatment": "shoulder treatment",
  "shoulder therapy": "shoulder therapy",
  "shouder therapy": "shoulder therapy",
  "rotater cuff": "rotator cuff",
  "rotatr cuff": "rotator cuff",
  "rotator cuf": "rotator cuff",
  "rotator coff": "rotator cuff",

  // Back Pain corrections
  backpain: "back pain",
  "sore back": "back pain",
  backache: "back pain",
  "bak pain": "back pain",
  bacak: "back pain",

  // Neck Pain corrections
  neckpain: "neck pain",
  "sore neck": "neck pain",
  "nek pain": "neck pain",
  neckache: "neck pain",
  "neak pain": "neck pain",

  // Hip Pain corrections
  hippain: "hip pain",
  "hip ache": "hip pain",
  hipache: "hip pain",
  "hipp pain": "hip pain",

  // Elbow Pain corrections
  elbowpain: "elbow pain",
  "elbow ache": "elbow pain",
  elbowache: "elbow pain",
  "elbo pain": "elbow pain",
  "elbrow pain": "elbow pain",
  "elbowe pain": "elbow pain",

  // Pelvic Floor corrections
  pelvicfloor: "pelvic floor",
  "pelvic flooor": "pelvic floor",
  "pelvic florr": "pelvic floor",
  "pelvic fold": "pelvic floor",

  // Hand/Wrist Pain corrections
  handwristpain: "hand/wrist pain",
  "hand wrist pain": "hand/wrist pain",
  wristpain: "hand/wrist pain",
  "wrist pain": "hand/wrist pain",
  "hand ache": "hand/wrist pain",
  "wrist ache": "hand/wrist pain",

  // Knee Pain corrections
  kneepain: "knee pain",
  "knee ache": "knee pain",
  kneeache: "knee pain",

  // Foot/Ankle Pain corrections
  footanklepain: "foot/ankle pain",
  "foot ankle pain": "foot/ankle pain",
  footache: "foot/ankle pain",
  anklepain: "foot/ankle pain",
  "ankle ache": "foot/ankle pain",
  ankleache: "foot/ankle pain",
  "foot ache": "foot/ankle pain",
};

export const BUTTON_OPTIONS = {
  main: [
    { text: "📅 Book Appointment", type: "appointment" },
    { text: "👩‍⚕️ Speak with Therapist", type: "staff" },
    { text: "👩‍⚕️ Our Services", type: "service" },
    { text: "❓ Ask PT Questions", type: "questions" },
    { text: "🏥 Clinic Info", type: "locations" },
  ],
  painAreas: [], // This will be initialized by generatePainAreaButtons
};

export function generatePainAreaButtons(detectedAreas = null) {
  if (detectedAreas && detectedAreas.length > 0) {
    return detectedAreas.map(({ key, data }) => ({
      text: `${data.icon} ${data.display}`,
      type: "pain",
      area: key,
      description: data.description,
    }));
  }

  return Object.entries(PAIN_AREAS)
    .slice(0, 10)
    .map(([key, data]) => ({
      text: `${data.icon} ${data.display}`,
      type: "pain",
      area: key,
      description: data.description,
    }));
}

// Initialize pain areas in BUTTON_OPTIONS
BUTTON_OPTIONS.painAreas = generatePainAreaButtons();
