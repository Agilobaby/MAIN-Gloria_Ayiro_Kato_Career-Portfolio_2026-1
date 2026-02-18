
export const API_URL = 'http://localhost:5000/api';
export const CONTACT_EMAIL = "ayirogloria@gmail.com";

// Using lh3.googleusercontent.com/d/ is often more reliable for direct embedding than drive.google.com/uc
export const PROFILE_IMAGE = "https://lh3.googleusercontent.com/d/1AxYqPJiacwBMosFsLLSmO19ehoPpRE1h";

/**
 * CV_URL points to the Google Docs PDF Export link.
 * This automatically converts your Google Doc to PDF when clicked.
 * This is the most reliable method as it does not require local file hosting.
 */
export const CV_URL = "https://docs.google.com/document/d/1C2DXPwKPuXytSmoYd2RXm-wUhZ14fcYdXRYpA1r5NJ8/export?format=pdf"; 

/**
 * Generates a Gmail Compose URL with pre-filled details.
 */
export const getHireMeLink = (context: string, specificDetail?: string) => {
  const subject = encodeURIComponent(`Professional Inquiry: ${context}`);
  let bodyText = `Dear Gloria,\n\nI am reaching out through your professional portfolio. I am interested in discussing your work regarding "${context}".`;
  
  if (specificDetail) {
    bodyText += `\n\nI was particularly impressed by the work demonstrated in your "${specificDetail}" case study.`;
  }
  
  bodyText += `\n\nPlease let me know when you would be available for a brief discussion regarding a potential collaboration.\n\nBest regards,\n[Your Name]`;
  const body = encodeURIComponent(bodyText);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${subject}&body=${body}`;
};

/**
 * Generates a Gmail link based on the contact form state.
 */
export const getContactFormMailLink = (data: { fullName?: string, email?: string, subject?: string, message?: string }) => {
  const name = data.fullName || '[Your Name]';
  const email = data.email || '[Your Email]';
  const subjectPrefix = data.subject ? `[Inquiry] ${data.subject}` : `Job Inquiry / Collaboration from ${name}`;
  const subject = encodeURIComponent(subjectPrefix);
  const timestamp = new Date().toLocaleString();
  
  const bodyText = `Dear Gloria Kato,\n\n${data.message || 'I am interested in your professional services and would like to discuss a potential opportunity.'}\n\nBest regards,\n${name}\n\n---\nRECRUITER IDENTIFICATION:\nFull Name: ${name}\nDirect Email: ${email}\nLogged Time: ${timestamp}\n\nSent via the Gloria Kato Portfolio System.`;
  const body = encodeURIComponent(bodyText);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${subject}&body=${body}`;
};

export interface CaseStudy {
  id: string;
  title: string;
  desc: string;
  images: string[];
}

export interface ServiceDetailData {
  id: string;
  icon: string;
  title: string;
  desc: string;
  features: string[];
  tools: string[];
  whyMe: string[];
  caseStudies: CaseStudy[];
}

export const INITIAL_SERVICES: ServiceDetailData[] = [
  {
    id: "tech-integration",
    icon: "smartphone",
    title: "Tech Integration",
    desc: "Expert guidance on seamlessly integrating digital tools into the classroom or workplace to enhance productivity and learning outcomes.",
    features: ["Digital Workflow Consulting", "Classroom Tech Training", "Hybrid Learning Strategies", "Device Deployment Planning"],
    tools: ["Apple School Manager", "Google Workspace", "Padlet", "Nearpod", "Seesaw"],
    whyMe: ["Pedagogy-First Approach", "Hands-on Training Expertise", "Scalable Solution Design"],
    caseStudies: [
      {
        id: "cs-ti-1",
        title: "iPad Learning Transformation",
        desc: "Implemented a 1-to-1 iPad program for a middle school, including workflow automation for assignments and assessments.",
        images: [
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600",
          "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=600",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600"
        ]
      },
      {
        id: "cs-ti-2",
        title: "Digital Citizenship Initiative",
        desc: "Developed a school-wide curriculum for online safety, ethics, and effective search strategies for primary students.",
        images: [
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600",
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600",
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600"
        ]
      },
      {
        id: "cs-ti-3",
        title: "Faculty Tech Onboarding",
        desc: "Designed and led workshops for 50+ staff members on integrating Google Classroom and collaborative tools into daily lessons.",
        images: [
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600",
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600",
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "web-design",
    icon: "layout",
    title: "Web Design",
    desc: "Crafting visually stunning, user-friendly, and accessible website designs that effectively communicate your brand message.",
    features: ["UI/UX Prototyping", "Responsive Layout Design", "Brand Guidelines", "Accessibility Auditing"],
    tools: ["Figma", "Adobe XD", "Canva", "Sketch"],
    whyMe: ["Clean & Modern Aesthetic", "User-Centric Methodology", "Mobile-First Thinking"],
    caseStudies: [
      {
        id: "cs-wd-1",
        title: "Modern Portfolio UI",
        desc: "Designed a minimalist portfolio layout for a creative agency focusing on typography and whitespace.",
        images: [
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600",
          "https://images.unsplash.com/photo-1541462608141-ad60317056b2?q=80&w=600",
          "https://images.unsplash.com/photo-1513506496266-aa6742535ae7?q=80&w=600",
          "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=600"
        ]
      },
      {
        id: "cs-wd-2",
        title: "Non-Profit Landing Page",
        desc: "Conceptualized a donation-focused landing page with clear calls to action and emotional visual storytelling.",
        images: [
          "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?q=80&w=600",
          "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=600",
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600",
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600"
        ]
      },
      {
        id: "cs-wd-3",
        title: "EdTech Dashboard",
        desc: "Designed a complex student management dashboard prioritizing data visualization and ease of navigation for teachers.",
        images: [
          "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=600",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
          "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=600",
          "https://images.unsplash.com/photo-1454165833767-027ffea9e778?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "web-development",
    icon: "code",
    title: "Web Development",
    desc: "Building functional, fast, and responsive websites using modern code and no-code tools tailored to your specific needs.",
    features: ["Frontend Development", "CMS Integration", "SEO Optimization", "Web Apps"],
    tools: ["React", "Tailwind CSS", "WordPress", "Node.js"],
    whyMe: ["Performance Focused", "SEO-Friendly Architecture", "Scalable Codebases"],
    caseStudies: [
      {
        id: "cs-dev-1",
        title: "Custom Inventory App",
        desc: "Developed a React-based inventory tracker for a logistics firm, integrating real-time database updates.",
        images: [
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600",
          "https://images.unsplash.com/photo-1542744095-2ad4870f6792?q=80&w=600",
          "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600"
        ]
      },
      {
        id: "cs-dev-2",
        title: "Educational Resource Hub",
        desc: "Built a resource-sharing platform for educators using WordPress, featuring membership and payment gateway integrations.",
        images: [
          "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600",
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600"
        ]
      },
      {
        id: "cs-dev-3",
        title: "Real Estate Directory",
        desc: "Developed a fast-loading property directory with advanced filtering and map integration using React.",
        images: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600",
          "https://images.unsplash.com/photo-1448630360428-6e2a2419261f?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "google-workspace",
    icon: "cloud",
    title: "Google Workspace",
    desc: "Specialized setup, administration, and training for Google Workspace for Education and Business environments.",
    features: ["Domain Setup & Migration", "Security Policies", "Apps Script Automation", "Admin Console Training"],
    tools: ["Admin Console", "AppSheet", "Apps Script", "Google Vault"],
    whyMe: ["Certified Admin Expertise", "Process Automation Specialist", "Secure System Design"],
    caseStudies: [
      {
        id: "cs-gw-1",
        title: "Enterprise Domain Migration",
        desc: "Managed the seamless migration of 200+ users from legacy systems to Google Workspace with zero downtime.",
        images: [
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600",
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600",
          "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=600"
        ]
      },
      {
        id: "cs-gw-2",
        title: "Custom CRM with AppSheet",
        desc: "Built a fully mobile-compatible sales tracking app using AppSheet, connecting directly to company spreadsheets.",
        images: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
          "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=600",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600",
          "https://images.unsplash.com/photo-1531206715517-5ca5c7f5c2b9?q=80&w=600"
        ]
      },
      {
        id: "cs-gw-3",
        title: "Workflow Automation Project",
        desc: "Automated an onboarding process using Apps Script to generate employee contracts and setup accounts instantly.",
        images: [
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "stem-coding",
    icon: "bot",
    title: "STEM & Coding Education",
    desc: "Empowering students with future-ready skills through hands-on robotics, coding, and computational thinking lessons.",
    features: ["Robotics Curriculum", "Scratch & Python Lessons", "Micro:bit Projects", "Computational Thinking"],
    tools: ["LEGO Mindstorms", "Micro:bit", "Scratch", "Python"],
    whyMe: ["Engaging Project Design", "Expert Facilitation", "Inclusion-Focused STEM"],
    caseStudies: [
      {
        id: "cs-stem-1",
        title: "FIRST LEGO League Lead",
        desc: "Coached a competitive robotics team, focusing on mechanical design and modular block programming.",
        images: [
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600",
          "https://images.unsplash.com/photo-1531746790731-6c307f8fb926?q=80&w=600",
          "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=600",
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600"
        ]
      },
      {
        id: "cs-stem-2",
        title: "Smart Home Arduino Project",
        desc: "Mentored high school students in building sensors for automated plant watering and light control systems.",
        images: [
          "https://images.unsplash.com/photo-1563770660941-20978e87081b?q=80&w=600",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
          "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=600",
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600"
        ]
      },
      {
        id: "cs-stem-3",
        title: "Python Data Science Workshop",
        desc: "Led a weekend intensive for teens on data visualization using Python and real-world environmental datasets.",
        images: [
          "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "graphic-design",
    icon: "pen-tool",
    title: "Graphic Design",
    desc: "Creating visual content for branding, education, and marketing including logos, posters, and digital assets.",
    features: ["Logo Design", "Educational Infographics", "Social Media Kits", "Print Layouts"],
    tools: ["Illustrator", "Photoshop", "Canva", "InDesign"],
    whyMe: ["Strategic Brand Focus", "Attention to Detail", "High-Impact Visuals"],
    caseStudies: [
      {
        id: "cs-gd-1",
        title: "Innovation Fair Branding",
        desc: "Created the complete visual identity package for a regional science fair, including posters, banners, and digital assets.",
        images: [
          "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600",
          "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=600",
          "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600",
          "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600"
        ]
      },
      {
        id: "cs-gd-2",
        title: "Public Health Infographics",
        desc: "Designed a series of 10 infographics for a local health organization to simplify complex medical data for patients.",
        images: [
          "https://images.unsplash.com/photo-1512486133939-0c84eca0ff91?q=80&w=600",
          "https://images.unsplash.com/photo-1572044162444-ad60f128bde3?q=80&w=600",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600",
          "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=600"
        ]
      },
      {
        id: "cs-gd-3",
        title: "E-commerce Social Media Kit",
        desc: "Developed a consistent set of Instagram and Facebook templates for a boutique brand to increase engagement.",
        images: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
          "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=600",
          "https://images.unsplash.com/photo-1556742049-04ff4361db77?q=80&w=600",
          "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=600"
        ]
      }
    ]
  },
  {
    id: "ict-support",
    icon: "monitor",
    title: "ICT Support",
    desc: "Reliable technical support for hardware and software, ensuring smooth operations for schools and small businesses.",
    features: ["Hardware Repair", "Network Troubleshooting", "Inventory Management", "User Helpdesk"],
    tools: ["Admin Console", "Remote Desktop", "Inventory Trackers", "Helpdesk Systems"],
    whyMe: ["Fast Problem Solving", "Proactive Maintenance", "Patient Technical Support"],
    caseStudies: [
      {
        id: "cs-is-1",
        title: "Network Refresh Project",
        desc: "Managed the physical rewiring and network hardware upgrade of a school server room.",
        images: [
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600",
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600",
          "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=600",
          "https://images.unsplash.com/photo-1510511459019-5dee997dd1db?q=80&w=600"
        ]
      },
      {
        id: "cs-is-2",
        title: "200-Device Deployment",
        desc: "Coordinated the intake, labeling, and console enrollment of 200 new student Chromebooks for a new school term.",
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600",
          "https://images.unsplash.com/photo-1454165833767-027ffea9e778?q=80&w=600",
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600"
        ]
      },
      {
        id: "cs-is-3",
        title: "Helpdesk Optimization",
        desc: "Streamlined the IT ticketing process for a large office, reducing response times by 40% through automated routing.",
        images: [
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
          "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=600",
          "https://images.unsplash.com/photo-1497215842964-22292b464194?q=80&w=600",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600"
        ]
      }
    ]
  }
];
