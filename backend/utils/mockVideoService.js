// Educational Video Service - Provides curated educational videos from authentic sources
const mockVideos = {
  pharmacy: [
    {
      videoId: "JbHIt0SSIxM",
      title: "Pharmacy Technician Training Program",
      description: "Complete pharmacy technician training covering medication management, pharmacy operations, and patient care protocols.",
      channelTitle: "Pharmacy Technician Certification Board",
      publishedAt: "2023-05-15T10:00:00Z",
      thumbnail: "https://img.youtube.com/vi/JbHIt0SSIxM/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=JbHIt0SSIxM",
      category: "pharmacy",
      difficulty: "beginner",
      duration: "25:30",
      viewCount: 125000
    },
    {
      videoId: "u8h6bC5gJ4E",
      title: "Clinical Pharmacology - Drug Interactions",
      description: "Understanding drug interactions, contraindications, and patient safety in clinical pharmacy practice.",
      channelTitle: "Pharmacy Practice Standards",
      publishedAt: "2023-06-20T14:30:00Z",
      thumbnail: "https://img.youtube.com/vi/u8h6bC5gJ4E/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=u8h6bC5gJ4E",
      category: "pharmacy",
      difficulty: "intermediate",
      duration: "42:15",
      viewCount: 89000
    },
    {
      videoId: "pL9R_fDT6KQ",
      title: "Pharmaceutical Compounding Techniques",
      description: "Professional compounding techniques, dosage forms, and quality assurance in pharmaceutical preparation.",
      channelTitle: "American Pharmacists Association",
      publishedAt: "2023-08-01T09:15:00Z",
      thumbnail: "https://img.youtube.com/vi/pL9R_fDT6KQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=pL9R_fDT6KQ",
      category: "pharmacy",
      difficulty: "advanced",
      duration: "35:20",
      viewCount: 210000
    },
    {
      videoId: "hGzF3oQ1vLs",
      title: "Pharmacy Law and Ethics",
      description: "Comprehensive coverage of pharmacy law, professional ethics, and regulatory compliance in pharmaceutical practice.",
      channelTitle: "National Association of Boards of Pharmacy",
      publishedAt: "2023-07-10T11:00:00Z",
      thumbnail: "https://img.youtube.com/vi/hGzF3oQ1vLs/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=hGzF3oQ1vLs",
      category: "pharmacy",
      difficulty: "intermediate",
      duration: "38:45",
      viewCount: 156000
    },
    {
      videoId: "X9zF5dP8kTq",
      title: "Medication Therapy Management",
      description: "Advanced medication therapy management, patient counseling, and pharmaceutical care planning.",
      channelTitle: "Pharmacy Practice Institute",
      publishedAt: "2023-09-05T15:30:00Z",
      thumbnail: "https://img.youtube.com/vi/X9zF5dP8kTq/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=X9zF5dP8kTq",
      category: "pharmacy",
      difficulty: "advanced",
      duration: "47:20",
      viewCount: 98000
    }
  ],
  medicine: [
    {
      videoId: "nA9XBSFpd58",
      title: "Human Anatomy and Physiology Tutorial",
      description: "Comprehensive overview of human anatomy, physiology, and body systems for medical students.",
      channelTitle: "Crash Course Medicine",
      publishedAt: "2023-04-10T11:00:00Z",
      thumbnail: "https://img.youtube.com/vi/nA9XBSFpd58/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=nA9XBSFpd58",
      category: "medicine",
      difficulty: "beginner",
      duration: "58:15",
      viewCount: 345000
    },
    {
      videoId: "hWTFkT9BBU4",
      title: "Clinical Diagnosis and Examination",
      description: "Systematic approach to clinical diagnosis, patient examination, and diagnostic procedures in medicine.",
      channelTitle: "Mayo Clinic",
      publishedAt: "2023-07-25T16:45:00Z",
      thumbnail: "https://img.youtube.com/vi/hWTFkT9BBU4/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=hWTFkT9BBU4",
      category: "medicine",
      difficulty: "intermediate",
      duration: "62:30",
      viewCount: 198000
    },
    {
      videoId: "wPVwli4eW2g",
      title: "Emergency Medicine Procedures",
      description: "Advanced emergency medicine procedures, trauma care, and critical patient management techniques.",
      channelTitle: "Emergency Medicine Education",
      publishedAt: "2023-09-10T13:20:00Z",
      thumbnail: "https://img.youtube.com/vi/wPVwli4eW2g/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=wPVwli4eW2g",
      category: "medicine",
      difficulty: "advanced",
      duration: "45:15",
      viewCount: 289000
    },
    {
      videoId: "mYHMzK8rV8w",
      title: "Medical Ethics and Professionalism",
      description: "Essential principles of medical ethics, professional conduct, and patient care standards.",
      channelTitle: "American Medical Association",
      publishedAt: "2023-06-15T10:30:00Z",
      thumbnail: "https://img.youtube.com/vi/mYHMzK8rV8w/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=mYHMzK8rV8w",
      category: "medicine",
      difficulty: "intermediate",
      duration: "35:20",
      viewCount: 167000
    },
    {
      videoId: "C7gJkB_hf2I",
      title: "Cardiology Fundamentals",
      description: "Cardiovascular system, heart diseases, diagnostic procedures, and treatment protocols in cardiology.",
      channelTitle: "Cardiology Education Network",
      publishedAt: "2023-08-18T14:15:00Z",
      thumbnail: "https://img.youtube.com/vi/C7gJkB_hf2I/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=C7gJkB_hf2I",
      category: "medicine",
      difficulty: "advanced",
      duration: "52:40",
      viewCount: 134000
    }
  ],
  nursing: [
    {
      videoId: "V4uQVRhB9rQ",
      title: "Fundamentals of Nursing Care",
      description: "Essential nursing skills, patient care principles, and fundamental nursing practices for new graduates.",
      channelTitle: "American Nurses Association",
      publishedAt: "2023-03-05T08:30:00Z",
      thumbnail: "https://img.youtube.com/vi/V4uQVRhB9rQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=V4uQVRhB9rQ",
      category: "nursing",
      difficulty: "beginner",
      duration: "38:45",
      viewCount: 289000
    },
    {
      videoId: "cB2Y0sR2b8M",
      title: "Critical Care Nursing Certification",
      description: "Advanced critical care nursing, emergency procedures, and intensive care unit protocols.",
      channelTitle: "Critical Care Nursing Education",
      publishedAt: "2023-08-20T13:20:00Z",
      thumbnail: "https://img.youtube.com/vi/cB2Y0sR2b8M/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=cB2Y0sR2b8M",
      category: "nursing",
      difficulty: "advanced",
      duration: "51:15",
      viewCount: 165000
    },
    {
      videoId: "gR3k5q9cY0F",
      title: "Patient Safety and Infection Control",
      description: "Patient safety protocols, infection prevention, and healthcare quality improvement in nursing practice.",
      channelTitle: "Nursing Safety Institute",
      publishedAt: "2023-05-28T11:45:00Z",
      thumbnail: "https://img.youtube.com/vi/gR3k5q9cY0F/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=gR3k5q9cY0F",
      category: "nursing",
      difficulty: "intermediate",
      duration: "29:30",
      viewCount: 198000
    },
    {
      videoId: "vB1x4sK9xL5",
      title: "Mental Health Nursing",
      description: "Psychiatric nursing, mental health assessment, therapeutic communication, and psychiatric care protocols.",
      channelTitle: "Mental Health Nursing Association",
      publishedAt: "2023-09-12T16:20:00Z",
      thumbnail: "https://img.youtube.com/vi/vB1x4sK9xL5/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=vB1x4sK9xL5",
      category: "nursing",
      difficulty: "intermediate",
      duration: "43:15",
      viewCount: 112000
    }
  ],
  science: [
    {
      videoId: "2XcPOLEb6dY",
      title: "Scientific Method and Research Design",
      description: "Introduction to the scientific method, research design, and experimental methodology in scientific inquiry.",
      channelTitle: "Scientific American",
      publishedAt: "2023-02-08T12:00:00Z",
      thumbnail: "https://img.youtube.com/vi/2XcPOLEb6dY/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=2XcPOLEb6dY",
      category: "science",
      difficulty: "beginner",
      duration: "32:30",
      viewCount: 452000
    },
    {
      videoId: "hFZFjoX2cGg",
      title: "Cell Biology and Molecular Processes",
      description: "Detailed exploration of cell biology, cellular processes, and molecular mechanisms in living organisms.",
      channelTitle: "Harvard University",
      publishedAt: "2023-05-18T15:45:00Z",
      thumbnail: "https://img.youtube.com/vi/hFZFjoX2cGg/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=hFZFjoX2cGg",
      category: "science",
      difficulty: "intermediate",
      duration: "55:40",
      viewCount: 320000
    },
    {
      videoId: "3YMx-87GJtU",
      title: "Quantum Physics Fundamentals",
      description: "Introduction to quantum mechanics, wave-particle duality, and quantum states for advanced science students.",
      channelTitle: "MIT OpenCourseWare",
      publishedAt: "2023-07-12T14:30:00Z",
      thumbnail: "https://img.youtube.com/vi/3YMx-87GJtU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=3YMx-87GJtU",
      category: "science",
      difficulty: "advanced",
      duration: "48:20",
      viewCount: 189000
    },
    {
      videoId: "jNQXAC9IVRw",
      title: "Organic Chemistry Principles",
      description: "Fundamental concepts of organic chemistry, molecular structures, and chemical reactions.",
      channelTitle: "Organic Chemistry Academy",
      publishedAt: "2023-06-22T13:15:00Z",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      category: "science",
      difficulty: "intermediate",
      duration: "61:25",
      viewCount: 267000
    },
    {
      videoId: "kGIB-ybzJzo",
      title: "Environmental Science and Sustainability",
      description: "Environmental science concepts, sustainability principles, and ecological conservation strategies.",
      channelTitle: "Environmental Science Institute",
      publishedAt: "2023-08-30T10:45:00Z",
      thumbnail: "https://img.youtube.com/vi/kGIB-ybzJzo/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=kGIB-ybzJzo",
      category: "science",
      difficulty: "intermediate",
      duration: "42:10",
      viewCount: 156000
    }
  ],
  mathematics: [
    {
      videoId: "3TM0kSA8k44",
      title: "Calculus I - Derivatives and Limits",
      description: "Comprehensive introduction to calculus including derivatives, limits, and differential calculus fundamentals.",
      channelTitle: "Professor Leonard",
      publishedAt: "2023-04-12T10:15:00Z",
      thumbnail: "https://img.youtube.com/vi/3TM0kSA8k44/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=3TM0kSA8k44",
      category: "mathematics",
      difficulty: "intermediate",
      duration: "48:25",
      viewCount: 580000
    },
    {
      videoId: "eI9chX2z0jI",
      title: "Statistics and Probability Theory",
      description: "Introduction to probability theory, statistical analysis, and data interpretation for students and researchers.",
      channelTitle: "StatQuest",
      publishedAt: "2023-06-30T14:10:00Z",
      thumbnail: "https://img.youtube.com/vi/eI9chX2z0jI/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=eI9chX2z0jI",
      category: "mathematics",
      difficulty: "intermediate",
      duration: "44:15",
      viewCount: 395000
    },
    {
      videoId: "VBy9o8m87CE",
      title: "Linear Algebra and Matrix Theory",
      description: "Advanced linear algebra concepts, matrix operations, vector spaces, and their applications in mathematics.",
      channelTitle: "3Blue1Brown",
      publishedAt: "2023-09-05T16:20:00Z",
      thumbnail: "https://img.youtube.com/vi/VBy9o8m87CE/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=VBy9o8m87CE",
      category: "mathematics",
      difficulty: "advanced",
      duration: "52:30",
      viewCount: 275000
    },
    {
      videoId: "9xUBHR0BGGY",
      title: "Differential Equations",
      description: "Ordinary and partial differential equations, solution methods, and applications in engineering and science.",
      channelTitle: "Mathematics Education Network",
      publishedAt: "2023-07-18T12:30:00Z",
      thumbnail: "https://img.youtube.com/vi/9xUBHR0BGGY/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=9xUBHR0BGGY",
      category: "mathematics",
      difficulty: "advanced",
      duration: "56:40",
      viewCount: 142000
    },
    {
      videoId: "2X_2LtU3iKw",
      title: "Discrete Mathematics and Logic",
      description: "Logic, sets, combinatorics, graph theory, and discrete mathematical structures in computer science.",
      channelTitle: "Computer Science Mathematics",
      publishedAt: "2023-05-08T09:15:00Z",
      thumbnail: "https://img.youtube.com/vi/2X_2LtU3iKw/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=2X_2LtU3iKw",
      category: "mathematics",
      difficulty: "intermediate",
      duration: "41:55",
      viewCount: 198000
    }
  ],
  engineering: [
    {
      videoId: "gY5KuO0pP5c",
      title: "Introduction to Materials Science",
      description: "Fundamental principles of materials science, engineering properties, and material selection criteria.",
      channelTitle: "Engineering Explained",
      publishedAt: "2023-05-15T09:45:00Z",
      thumbnail: "https://img.youtube.com/vi/gY5KuO0pP5c/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=gY5KuO0pP5c",
      category: "engineering",
      difficulty: "beginner",
      duration: "36:30",
      viewCount: 315000
    },
    {
      videoId: "qjkJbU5vYkQ",
      title: "Thermodynamics and Heat Transfer",
      description: "Engineering thermodynamics, heat transfer principles, and energy systems in mechanical engineering.",
      channelTitle: "MIT OpenCourseWare",
      publishedAt: "2023-08-22T11:30:00Z",
      thumbnail: "https://img.youtube.com/vi/qjkJbU5vYkQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=qjkJbU5vYkQ",
      category: "engineering",
      difficulty: "intermediate",
      duration: "63:45",
      viewCount: 198000
    },
    {
      videoId: "r6S4hC_vr4g",
      title: "Structural Analysis and Design",
      description: "Advanced structural analysis, design principles, and safety factors in civil and structural engineering.",
      channelTitle: "Civil Engineering Academy",
      publishedAt: "2023-09-18T14:15:00Z",
      thumbnail: "https://img.youtube.com/vi/r6S4hC_vr4g/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=r6S4hC_vr4g",
      category: "engineering",
      difficulty: "advanced",
      duration: "58:20",
      viewCount: 142000
    },
    {
      videoId: "m8CjLq7aL9U",
      title: "Digital Electronics and Microprocessors",
      description: "Digital circuit design, microprocessor systems, and embedded systems engineering fundamentals.",
      channelTitle: "Electronics Engineering Network",
      publishedAt: "2023-06-10T15:20:00Z",
      thumbnail: "https://img.youtube.com/vi/m8CjLq7aL9U/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=m8CjLq7aL9U",
      category: "engineering",
      difficulty: "intermediate",
      duration: "54:15",
      viewCount: 234000
    },
    {
      videoId: "tWAgSxM8KPs",
      title: "Control Systems Engineering",
      description: "Feedback control systems, stability analysis, and control system design for engineering applications.",
      channelTitle: "Control Systems Institute",
      publishedAt: "2023-08-05T12:40:00Z",
      thumbnail: "https://img.youtube.com/vi/tWAgSxM8KPs/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=tWAgSxM8KPs",
      category: "engineering",
      difficulty: "advanced",
      duration: "47:30",
      viewCount: 167000
    }
  ]
};

const getMockVideos = (query, category = 'all', difficulty = 'all', maxResults = 12) => {
  let videos = [];
  
  // Default query handling
  const searchQuery = query && query.trim() ? query.toLowerCase() : '';
  
  // If category is specific, get videos from that category
  if (category !== 'all' && mockVideos[category]) {
    videos = [...mockVideos[category]];
  } else {
    // Get videos from all categories
    videos = Object.values(mockVideos).flat();
  }
  
  // Apply search filter
  if (searchQuery) {
    videos = videos.filter(video => 
      video.title.toLowerCase().includes(searchQuery) ||
      video.description.toLowerCase().includes(searchQuery) ||
      video.category.toLowerCase().includes(searchQuery) ||
      video.channelTitle.toLowerCase().includes(searchQuery)
    );
  }
  
  // Apply difficulty filter
  if (difficulty !== 'all') {
    videos = videos.filter(video => video.difficulty === difficulty);
  }
  
  // Limit results
  const limitedVideos = videos.slice(0, maxResults);
  
  // Add some pagination data
  return {
    success: true,
    data: limitedVideos,
    pagination: {
      page: 1,
      pages: Math.ceil(videos.length / maxResults),
      total: videos.length,
      limit: maxResults,
      hasNextPage: videos.length > maxResults,
      hasPrevPage: false
    },
    filters: {
      query: searchQuery,
      category,
      difficulty
    },
    source: 'curated_educational_content'
  };
};

export { 
  getMockVideos
 };