export const ACADEMIC_LEVELS = [
  { value: '100', label: 'Level 100' },
  { value: '200', label: 'Level 200' },
  { value: '300', label: 'Level 300' },
  { value: '400', label: 'Level 400' },
  { value: '500', label: 'Level 500' }
];

export const SEMESTERS = [
  { value: '1', label: 'First Semester' },
  { value: '2', label: 'Second Semester' }
];

export const COURSE_CATEGORIES = {
  '100': {
    '1': [
      { code: 'PHAR101', name: 'African Studies' },
      { code: 'PHAR102', name: 'Computer Literacy' },
      { code: 'PHAR103', name: 'Communication Skills I' },
      { code: 'PHAR104', name: 'Dispensing Techniques I' },
      { code: 'PHAR105', name: 'Dispensing Techniques Practicals I' },
      { code: 'PHAR106', name: 'Chemistry I' },
      { code: 'PHAR107', name: 'Chemistry Practicals I' },
      { code: 'PHAR108', name: 'Physiology I' },
      { code: 'PHAR109', name: 'First Aid' },
      { code: 'PHAR110', name: 'Hospital Practice I' }
    ],
    '2': [
      { code: 'PHAR111', name: 'Dispensing Techniques II' },
      { code: 'PHAR112', name: 'Dispensing Techniques Practicals II' },
      { code: 'PHAR113', name: 'Chemistry II' },
      { code: 'PHAR114', name: 'Chemistry Practicals II' },
      { code: 'PHAR115', name: 'Physiology II' },
      { code: 'PHAR116', name: 'Hospital Practice II' },
      { code: 'PHAR117', name: 'Communication Skills II' },
      { code: 'PHAR118', name: 'African Studies' }
    ]
  },
  '200': {
    '1': [
      { code: 'PHAR201', name: 'Basic Pharmaceutical Microbiology' },
      { code: 'PHAR202', name: 'Basic Pharmaceutical Microbiology Practicals' },
      { code: 'PHAR203', name: 'Therapeutics I' },
      { code: 'PHAR204', name: 'Hospital Practice III' },
      { code: 'PHAR205', name: 'Forensic I' },
      { code: 'PHAR206', name: 'Basic Management' },
      { code: 'PHAR207', name: 'Physical Chemistry' },
      { code: 'PHAR208', name: 'Physical Chemistry Practicals' },
      { code: 'PHAR209', name: 'Pharmaceutical Entrepreneurship' }
    ],
    '2': [
      { code: 'PHAR210', name: 'Quality Control and Instrumentation Technology I' },
      { code: 'PHAR211', name: 'Quality Control and Instrumentation Technology Practicals I' },
      { code: 'PHAR212', name: 'Dispensing Techniques III' },
      { code: 'PHAR213', name: 'Dispensing Techniques Practicals III' },
      { code: 'PHAR214', name: 'Store Keeping' },
      { code: 'PHAR215', name: 'Organic Chemistry IV' },
      { code: 'PHAR216', name: 'Organic Chemistry Practicals IV' },
      { code: 'PHAR217', name: 'Therapeutics II' },
      { code: 'PHAR218', name: 'Research Methodology' },
      { code: 'PHAR219', name: 'Statistics' }
    ]
  }
};

export const FILE_TYPES = {
  pdf: { icon: '📄', color: '#dc2626', label: 'PDF' },
  image: { icon: '🖼️', color: '#059669', label: 'Image' },
  doc: { icon: '📝', color: '#2563eb', label: 'Document' }
};

export const APP_CONSTANTS = {
  APP_NAME: 'Pharmacy Past Questions',
  APP_DESCRIPTION: 'Comprehensive past questions platform for pharmacy students',
  CONTACT_EMAIL: 'support@pharmacyuniversity.edu',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};