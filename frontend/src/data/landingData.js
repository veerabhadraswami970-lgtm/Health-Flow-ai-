/**
 * HealthFlow AI - Data-Driven Landing Page Configuration
 * Centralized content source for editorial copy, rotating hero panels,
 * impact stats, service tabs, testimonials, news stories, and emergency info.
 */

export const landingData = {
  announcement: {
    text: "24/7 National Emergency & Health Assistance • Call 108 / 112 • ABDM & CDSCO Compliant",
    quickLinks: [
      { label: "Emergency SOS", href: "#crisis" },
      { label: "Find Doctors", href: "#services" },
      { label: "Govt Schemes", href: "#impact" }
    ]
  },

  hero: {
    eyebrow: "AI-POWERED HEALTHCARE FOR EVERY CITIZEN",
    titleWords: ["Where", "Healing", "Takes", "Root,"],
    titleHighlight: "Powered by AI.",
    subtitle: "Connecting patients, doctors, hospitals, and pharmacies into one seamless, equitable healthcare ecosystem. Dignified care in your language, at your fingertips.",
    rotatingPanels: [
      {
        id: "panel-a",
        badge: "Patient Services",
        title: "Book OPD & Tele-Consultations",
        desc: "Skip long queues. Instantly match with top verified doctors across government & private hospitals.",
        ctaText: "Book Appointment",
        ctaTab: "appointments",
        accent: "teal"
      },
      {
        id: "panel-b",
        badge: "Financial Aid",
        title: "Discover Ayushman Bharat & Govt Schemes",
        desc: "Auto-check eligibility for PM-JAY, State Health Schemes & BPL medical subsidies in under 30 seconds.",
        ctaText: "Find Schemes",
        ctaTab: "schemes",
        accent: "coral"
      },
      {
        id: "panel-c",
        badge: "24/7 Safety",
        title: "Immediate Emergency SOS & Ambulance",
        desc: "One-tap emergency dispatch, live blood bank inventory finder, and trusted contact alert pings.",
        ctaText: "Emergency Help",
        ctaTab: "emergency",
        accent: "danger"
      }
    ]
  },

  mission: {
    quote: "“Healthcare is not a privilege for the few — it is a fundamental human right. We harness artificial intelligence to break barriers of distance, language, and affordability for 1.4 billion lives.”",
    author: "Dr. A. Sharma",
    title: "Chief Medical Officer & Founder, HealthFlow AI"
  },

  spotlight: {
    eyebrow: "CELEBRATING MILESTONES & PROGRESS",
    title: "Innovating Care Delivery for Rural and Urban India",
    desc: "From digitized QR prescriptions to automated Ayushman Bharat scheme matching, HealthFlow AI bridges the critical gap between patients and lifesaving medical infrastructure.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Doctor reviewing digital health record on tablet with patient",
    linkText: "Read Our Full Impact Whitepaper"
  },

  stats: [
    { value: 250000, suffix: "+", label: "Lives Reached", desc: "Across 14 states in India" },
    { value: 98, suffix: "%", label: "Patient Satisfaction", desc: "Verified consultation rating" },
    { value: 4500, suffix: "+", label: "Empaneled Doctors", desc: "ABDM HPR verified specialists" },
    { value: 12, suffix: "M+", label: "Records Digitized", desc: "FHIR-compliant health documents" }
  ],

  featuredTestimonial: {
    quote: "When my father needed urgent cardiac care in our village, HealthFlow AI matched us to an empaneled hospital 12 km away, verified our PM-JAY card automatically, and arranged an ambulance in 8 minutes. It saved his life.",
    author: "Ramesh Patel",
    location: "Warangal, Telangana",
    role: "Patient Family Member",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Portrait of Ramesh Patel smiling warmly"
  },

  crisis: {
    badge: "CRITICAL SAFETY ASSISTANCE",
    title: "Need Immediate Medical Help or Emergency Transport?",
    description: "If you or a loved one are experiencing a medical emergency, acute trauma, or severe illness, act quickly. HealthFlow AI provides instant SOS routing and verified emergency contacts.",
    primaryCta: "Trigger Emergency SOS",
    secondaryCta: "National Emergency Helpline: 112 / 108",
    disclaimer: "HealthFlow AI integrates with verified national emergency dispatch services (108/112). For immediate life-threatening situations, dial 112 directly from any mobile phone."
  },

  serviceTabs: [
    {
      id: "patients",
      label: "Patients & Families",
      services: [
        {
          id: "p1",
          title: "AI Prescription Scanner & Reader",
          desc: "Upload handwritten doctor prescriptions. Get plain-language medicine explanations, dosages, and safety warnings in your mother tongue.",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Prescription scanner preview",
          badge: "AI Powered"
        },
        {
          id: "p2",
          title: "Ayushman Bharat & Govt Schemes",
          desc: "Smart eligibility engine matches your income, region, and medical history with PM-JAY and state health benefits.",
          image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Government health scheme finder",
          badge: "Govt Subsidies"
        },
        {
          id: "p3",
          title: "Real-Time Blood Bank Inventory",
          desc: "Search live e-RaktKosh blood availability by blood group, component, and distance across accredited blood centers.",
          image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Blood bank inventory search",
          badge: "Live Data"
        }
      ]
    },
    {
      id: "doctors",
      label: "Doctors & Specialists",
      services: [
        {
          id: "d1",
          title: "ABDM HPR Digital QR Prescriptions",
          desc: "Generate cryptographically signed, QR-coded digital prescriptions in 10 seconds. Fully ABDM & HPR verified.",
          image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Doctor writing digital prescription",
          badge: "HPR Verified"
        },
        {
          id: "d2",
          title: "Unified Patient EHR & History",
          desc: "Access consent-managed longitudinal health records, lab reports, and medication histories across hospital visits.",
          image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Patient EHR timeline view",
          badge: "FHIR Standard"
        }
      ]
    },
    {
      id: "pharmacists",
      label: "Pharmacists & Chemists",
      services: [
        {
          id: "ph1",
          title: "Instant QR Token Authentication",
          desc: "Scan patient QR codes to verify prescription authenticity, doctor cryptographic signatures, and CDSCO Schedule-H compliance.",
          image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Pharmacist scanning medicine QR code",
          badge: "CDSCO Shield"
        },
        {
          id: "ph2",
          title: "Smart Inventory & Stock Checker",
          desc: "Track medicine stock levels, expiry alerts, and substitute suggestions for out-of-stock critical formulations.",
          image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Pharmacy stock management shelf",
          badge: "Inventory AI"
        }
      ]
    },
    {
      id: "hospitals",
      label: "Hospitals & Clinics",
      services: [
        {
          id: "h1",
          title: "Real-Time Bed & ICU Capacity Tracker",
          desc: "Manage inpatient, ICU, and oxygen bed availability in real-time for ABDM HFR registry integration and emergency routing.",
          image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Modern hospital room and ICU bed",
          badge: "HFR Registered"
        },
        {
          id: "h2",
          title: "Automated Emergency & OPD Queueing",
          desc: "Streamline OPD appointment slots and emergency triage to reduce hospital wait times by up to 40%.",
          image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
          imageAlt: "Hospital reception triage queue",
          badge: "UHI Protocol"
        }
      ]
    }
  ],

  careers: {
    eyebrow: "JOIN OUR MISSION",
    title: "Build a Meaningful Career in Healthcare AI",
    desc: "We are engineers, clinicians, data scientists, and healthcare advocates passionate about making dignified care accessible to everyone. Explore opportunities to join our team.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Diverse team collaborating in modern office",
    ctaText: "Explore Open Positions"
  },

  testimonialCarousel: [
    {
      id: "t1",
      quote: "HealthFlow AI allowed our PHC clinic in a remote district to issue digital prescriptions and verify Ayushman Bharat cards without complex infrastructure. It transformed how we treat 300+ patients daily.",
      author: "Dr. Sunita Rao",
      role: "Medical Officer, Primary Health Centre",
      location: "Chittoor, Andhra Pradesh"
    },
    {
      id: "t2",
      quote: "As a pharmacist, verifying Schedule-H drugs used to take phone calls and guesswork. Now, one scan of the HealthFlow QR code gives me verified doctor signatures instantly.",
      author: "Vikram Mehta",
      role: "Registered Pharmacist",
      location: "Bengaluru, Karnataka"
    },
    {
      id: "t3",
      quote: "Finding rare AB-ve blood for my sister during surgery was terrifying until the HealthFlow Blood Finder pinpointed an accredited bank with 2 units available 6 km away.",
      author: "Priya Sharma",
      role: "Patient Caregiver",
      location: "Hyderabad, Telangana"
    }
  ],

  newsCategories: ["All Stories", "AI Innovations", "Patient Hope", "ABDM News"],
  
  newsStories: [
    {
      id: "n1",
      category: "AI Innovations",
      title: "How Optical Character Recognition is Decoding Complex Doctor Prescriptions",
      desc: "Our deep learning OCR model translates medical handwriting into structured dosage guidelines in 11 Indian regional languages.",
      readTime: "4 min read",
      date: "August 2026",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
      imageAlt: "Doctor reviewing digital scan"
    },
    {
      id: "n2",
      category: "Patient Hope",
      title: "Democratizing PM-JAY Scheme Access Across Rural Communities",
      desc: "Over 50,000 families enrolled in government health cover through HealthFlow AI's automated eligibility scanner.",
      readTime: "5 min read",
      date: "July 2026",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
      imageAlt: "Healthcare worker assisting villager"
    },
    {
      id: "n3",
      category: "ABDM News",
      title: "Achieving 100% ABDM FHIR Compliance for Interoperable Health Records",
      desc: "HealthFlow AI completes full integration with Ayushman Bharat Digital Mission HPR, HFR, and UHI gateway specifications.",
      readTime: "6 min read",
      date: "June 2026",
      image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=600&q=80",
      imageAlt: "Digital health data encryption concept"
    }
  ],

  connectCta: {
    title: "Ready to Experience Dignified, Connected Healthcare?",
    subtitle: "Join thousands of patients, doctors, hospitals, and pharmacies using HealthFlow AI every day.",
    primaryBtn: "Get Started Now",
    secondaryBtn: "Schedule a Demo",
    emergencyBtn: "Emergency Help 108 / 112"
  },

  footer: {
    about: "HealthFlow AI is an AI-powered healthcare platform built to connect patients, doctors, hospitals, and pharmacies into an equitable, dignified care ecosystem across India.",
    col1Title: "Platform Sections",
    col1Links: [
      { label: "Home", href: "#hero" },
      { label: "Services & Roles", href: "#services" },
      { label: "Impact & Stats", href: "#impact" },
      { label: "Patient Stories", href: "#stories" },
      { label: "Careers", href: "#careers" }
    ],
    col2Title: "Role Portals",
    col2Links: [
      { label: "Patient Portal", role: "Patient" },
      { label: "Doctor OPD Portal", role: "Doctor" },
      { label: "Hospital Admin Portal", role: "HospitalAdmin" },
      { label: "Pharmacist Portal", role: "Pharmacist" },
      { label: "Super Admin Hub", role: "DataAdmin" }
    ],
    col3Title: "Support & Compliance",
    col3Links: [
      { label: "Emergency SOS (108 / 112)", href: "#crisis" },
      { label: "ABDM Compliance (HPR/HFR)", href: "#impact" },
      { label: "CDSCO Safety Standards", href: "#services" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" }
    ],
    emergencyNotice: "Emergency Medical Disclaimer: HealthFlow AI complements national emergency infrastructure (108 / 112). In life-threatening emergencies, dial 112 immediately.",
    copyright: "© 2026 HealthFlow AI. All rights reserved. Built with pride for accessible healthcare."
  }
};
