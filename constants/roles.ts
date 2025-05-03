export const roleCategories = [
  {
    category: "Social Media + Marketing",
    roles: [
      "Marketing Technologist",
      "SEO Specialist",
      "Web Analytics Developer",
      "Digital Marketing Manager",
      "Social Media Manager",
      "Growth Hacker"
    ],
    techStack: [
      "HTML, CSS, JavaScript (basic)",
      "SEMrush, Ahrefs, Moz, Screaming Frog",
      "Google Analytics, Google Tag Manager, Hotjar, Mixpanel",
      "HubSpot, Mailchimp, Marketo, ActiveCampaign",
      "Salesforce, Zoho, Pipedrive",
      "Optimizely, VWO, Google Optimize",
      "WordPress, Webflow, HubSpot CMS"
    ]
  },
  {
    category: "Content",
    roles: [
      "Content Manager",
      "Content Strategist",
      "Information Architect"
    ],
    techStack: [
      "WordPress, Contentful, Sanity, Ghost",
      "Grammarly, Hemingway, Surfer SEO",
      "Miro, Figma, Lucidchart, Notion",
      "Yoast SEO, SEMrush, Clearscope",
      "Google Workspace, Notion, Trello"
    ]
  },
  {
    category: "User Experience",
    roles: [
      "UX Designer",
      "UI Designer",
      "Accessibility Specialist",
      "Interaction Designer"
    ],
    techStack: [
      "Figma, Adobe XD, Sketch, InVision",
      "Framer, Principle, Axure",
      "axe, WAVE, Lighthouse, ARIA roles",
      "Balsamiq, Whimsical",
      "Maze, Lookback, UsabilityHub",
      "Material UI, IBM Carbon, Tailwind UI"
    ]
  },
  {
    category: "Front-End Development",
    roles: [
      "Front-End Designer",
      "Front-End Developer"
    ],
    techStack: [
      "HTML5, CSS3, JavaScript (ES6+), TypeScript",
      "React.js, Vue.js, Angular, Svelte",
      "Tailwind CSS, Sass, Bootstrap, Styled Components",
      "Webpack, Vite, Babel",
      "Jest, React Testing Library, Cypress, Playwright"
    ]
  },
  {
    category: "Back-End Development",
    roles: [
      "Mobile Developer",
      "Full-Stack Developer",
      "Software Developer",
      "WordPress Developer",
      "Frameworks Specialist",
      "React Developer",
      "Python Developer"
    ],
    techStack: [
      "JavaScript/TypeScript (Node.js), Python, Java, PHP, Ruby, Go, C#",
      "Express.js, Django, Flask, Laravel, Ruby on Rails, Spring Boot, FastAPI",
      "PostgreSQL, MongoDB, MySQL, Redis, Firebase",
      "WordPress (PHP), Headless CMS (Strapi, Sanity)",
      "REST, GraphQL, gRPC",
      "Git, GitHub/GitLab/Bitbucket",
      "Docker, Kubernetes, Jenkins, GitHub Actions"
    ]
  },
  {
    category: "Immersive Technologies",
    roles: [
      "3D Designer",
      "AR/VR Developer",
      "Game Developer",
      "Augmented Reality (AR) Designer",
      "Virtual Reality (VR) Designer"
    ],
    techStack: [
      "Unity (C#), Unreal Engine (C++)",
      "Blender, Maya, 3ds Max, Cinema 4D",
      "ARKit (iOS), ARCore (Android), WebXR, Vuforia, Oculus SDK",
      "C#, C++, JavaScript (Three.js, Babylon.js)",
      "Spark AR, Lens Studio, A-Frame"
    ]
  },
  {
    category: "Systems",
    roles: [
      "Business Systems Analyst",
      "Systems Engineer",
      "Systems Administrator"
    ],
    techStack: [
      "Linux, Windows Server, macOS",
      "Bash, PowerShell, Python",
      "VMware, Hyper-V",
      "Nagios, Zabbix, Prometheus, Grafana",
      "Ansible, Puppet, Chef",
      "AWS, Azure, GCP"
    ]
  },
  {
    category: "Artificial Intelligence",
    roles: [
      "AI Developer",
      "Algorithm Engineer",
      "Machine Learning Engineer"
    ],
    techStack: [
      "Python, R, Julia, C++",
      "TensorFlow, PyTorch, scikit-learn, OpenCV, HuggingFace Transformers",
      "Jupyter, Google Colab, Databricks",
      "MLflow, DVC, Kubeflow, Airflow",
      "AWS SageMaker, Azure ML, Google Vertex AI"
    ]
  },
  {
    category: "Data",
    roles: [
      "Database Administrator",
      "Data Architect",
      "Data Modeler",
      "Data Analyst",
      "Data Scientist",
      "Cloud Architect"
    ],
    techStack: [
      "SQL, Python, R",
      "MySQL, PostgreSQL, MongoDB, Oracle, Snowflake, BigQuery",
      "Redshift, Snowflake, Azure Synapse",
      "Tableau, Power BI, Looker, matplotlib, Seaborn",
      "Apache Airflow, Talend, dbt, Fivetran",
      "Apache Spark, Hadoop, Kafka"
    ]
  },
  {
    category: "Management",
    roles: [
      "Technical Lead",
      "DevOps Manager",
      "Agile Project Manager",
      "Product Manager",
      "Technical Account Manager"
    ],
    techStack: [
      "Jira, Trello, ClickUp, Notion, Monday.com",
      "Scrum, Kanban, SAFe",
      "AWS, Azure, GCP",
      "Terraform, AWS CloudFormation",
      "Jenkins, GitHub Actions, CircleCI, Argo CD",
      "Docker, Kubernetes",
      "Prometheus, Grafana, Datadog, New Relic"
    ]
  },
  {
    category: "Specialists",
    roles: [
      "Security Specialist",
      "QA (Quality Assurance) Specialist",
      "Computer Graphics Animator",
      "Mobile App Developer"
    ],
    techStack: [
      "OWASP ZAP, Burp Suite, Nessus, Metasploit",
      "Selenium, Cypress, Playwright, TestRail, Postman",
      "Adobe After Effects, Blender, Spine, Toon Boom",
      "React Native, Flutter, Swift (iOS), Kotlin (Android), Xamarin"
    ]
  }
];

// Helper function to get all roles as a flat array
export const getAllRoles = () => {
  return roleCategories.flatMap(category => category.roles);
};

// Helper function to get tech stack for a specific role
export const getTechStackForRole = (role: string) => {
  for (const category of roleCategories) {
    if (category.roles.includes(role)) {
      return category.techStack;
    }
  }
  return ["JavaScript", "HTML", "CSS"]; // Default tech stack
};

// Helper function to get random role and tech stack
export const getRandomRoleAndTechStack = () => {
  // Get random category
  const randomCategory = roleCategories[Math.floor(Math.random() * roleCategories.length)];
  
  // Get random role from that category
  const randomRole = randomCategory.roles[Math.floor(Math.random() * randomCategory.roles.length)];
  
  // Get 2-3 random tech stack items from that category
  const techStackItems = [...randomCategory.techStack];
  const shuffledTechStack = techStackItems.sort(() => 0.5 - Math.random());
  const selectedTechStack = shuffledTechStack.slice(0, Math.floor(Math.random() * 2) + 2);
  
  return {
    role: randomRole,
    techStack: selectedTechStack.join(", ")
  };
};
