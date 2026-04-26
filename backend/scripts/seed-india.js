require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Content = require('../models/Content');
const Timeline = require('../models/Timeline');
const FAQ = require('../models/FAQ');
const SiteSettings = require('../models/SiteSettings');

const seedIndianData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Content.deleteMany({});
    await Timeline.deleteMany({});
    await FAQ.deleteMany({});
    await SiteSettings.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@electedu.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN'
    });
    await adminUser.save();

    // Create sample users
    const users = [
      {
        email: 'rahul@example.com',
        password: 'password123',
        name: 'Rahul Kumar',
        role: 'USER'
      },
      {
        email: 'priya@example.com',
        password: 'password123',
        name: 'Priya Sharma',
        role: 'USER'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log('Created users');

    // Create Indian election quizzes
    const quizzes = [
      {
        title: 'Indian Voting Basics Quiz',
        description: 'Test your knowledge of fundamental voting concepts in India',
        category: 'voting-basics',
        difficulty: 'beginner',
        timeLimit: 600,
        questions: [
          {
            question: 'What is the minimum age to vote in India?',
            options: ['16 years', '18 years', '21 years', '25 years'],
            correctAnswer: 1,
            explanation: 'The voting age in India was lowered from 21 to 18 years through the 61st Constitutional Amendment Act in 1989.'
          },
          {
            question: 'Which document is mandatory to vote in India?',
            options: ['Aadhaar Card', 'Voter ID Card (EPIC)', 'Driving License', 'PAN Card'],
            correctAnswer: 1,
            explanation: 'The Voter ID Card (EPIC - Electors Photo Identity Card) is the primary document for voting, though other government-issued photo IDs are also accepted.'
          },
          {
            question: 'What does EVM stand for?',
            options: ['Electronic Voting Machine', 'Electoral Voting Method', 'Election Verification Module', 'Electronic Vote Monitor'],
            correctAnswer: 0,
            explanation: 'EVM stands for Electronic Voting Machine, which is used for conducting elections in India since 2004.'
          },
          {
            question: 'Which body conducts elections in India?',
            options: ['Supreme Court', 'Election Commission of India', 'Parliament', 'President'],
            correctAnswer: 1,
            explanation: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for conducting free and fair elections.'
          },
          {
            question: 'What is NOTA in Indian elections?',
            options: ['Notice of Transfer Act', 'None of the Above', 'National Oath Taking Authority', 'New Online Tracking Application'],
            correctAnswer: 1,
            explanation: 'NOTA (None of the Above) option allows voters to officially register a vote of rejection for all candidates in the constituency.'
          }
        ],
        tags: ['voting', 'basics', 'india'],
        isActive: true
      },
      {
        title: 'Indian Electoral System Quiz',
        description: 'Test your understanding of India\'s electoral system',
        category: 'electoral-system',
        difficulty: 'intermediate',
        timeLimit: 900,
        questions: [
          {
            question: 'How many members are there in the Lok Sabha?',
            options: ['543', '545', '550', '552'],
            correctAnswer: 1,
            explanation: 'The Lok Sabha has 545 members - 543 elected from constituencies and 2 nominated by the President from the Anglo-Indian community.'
          },
          {
            question: 'What is the term of Lok Sabha?',
            options: ['4 years', '5 years', '6 years', '7 years'],
            correctAnswer: 1,
            explanation: 'The normal term of the Lok Sabha is 5 years from the date of its first meeting, unless dissolved earlier.'
          },
          {
            question: 'Which electoral system is used for Lok Sabha elections?',
            options: ['Proportional Representation', 'First Past the Post', 'Mixed System', 'Ranked Choice'],
            correctAnswer: 1,
            explanation: 'India uses the First Past the Post (FPTP) system for Lok Sabha elections, where the candidate with the most votes wins.'
          },
          {
            question: 'How many members are in the Rajya Sabha?',
            options: ['238', '245', '250', '255'],
            correctAnswer: 1,
            explanation: 'The Rajya Sabha has a maximum of 245 members - 233 elected from states and UTs, and 12 nominated by the President.'
          },
          {
            question: 'What is the minimum age to contest for Lok Sabha?',
            options: ['18 years', '21 years', '25 years', '30 years'],
            correctAnswer: 2,
            explanation: 'A person must be at least 25 years old to contest for Lok Sabha elections in India.'
          }
        ],
        tags: ['lok-sabha', 'parliament', 'electoral-system'],
        isActive: true
      },
      {
        title: 'Indian Constitution and Voting Rights',
        description: 'Learn about constitutional provisions for voting in India',
        category: 'history',
        difficulty: 'intermediate',
        timeLimit: 900,
        questions: [
          {
            question: 'Which Article of the Constitution deals with elections?',
            options: ['Article 324', 'Article 326', 'Article 329', 'Article 330'],
            correctAnswer: 0,
            explanation: 'Article 324 of the Indian Constitution deals with the superintendence, direction, and control of elections by the Election Commission.'
          },
          {
            question: 'When was universal adult suffrage introduced in India?',
            options: ['1947', '1950', '1952', '1956'],
            correctAnswer: 1,
            explanation: 'Universal adult suffrage was introduced in India with the adoption of the Constitution on January 26, 1950.'
          },
          {
            question: 'Which amendment reduced the voting age from 21 to 18?',
            options: ['42nd Amendment', '52nd Amendment', '61st Amendment', '73rd Amendment'],
            correctAnswer: 2,
            explanation: 'The 61st Constitutional Amendment Act, 1988, reduced the voting age from 21 to 18 years.'
          },
          {
            question: 'What does Article 326 guarantee?',
            options: ['Right to vote', 'Adult suffrage', 'Free and fair elections', 'Secret ballot'],
            correctAnswer: 1,
            explanation: 'Article 326 guarantees adult suffrage - elections to the Lok Sabha and State Legislative Assemblies shall be on the basis of adult suffrage.'
          },
          {
            question: 'When was the first general election held in India?',
            options: ['1947', '1950', '1951-52', '1957'],
            correctAnswer: 2,
            explanation: 'The first general election in India was held from October 1951 to February 1952, covering 489 constituencies.'
          }
        ],
        tags: ['constitution', 'voting-rights', 'history'],
        isActive: true
      },
      {
        title: 'State Elections and Local Bodies',
        description: 'Test your knowledge about state and local elections in India',
        category: 'electoral-system',
        difficulty: 'intermediate',
        timeLimit: 600,
        questions: [
          {
            question: 'What is the term of State Legislative Assembly?',
            options: ['4 years', '5 years', '6 years', '7 years'],
            correctAnswer: 1,
            explanation: 'The normal term of a State Legislative Assembly is 5 years, similar to the Lok Sabha.'
          },
          {
            question: 'Which amendment introduced Panchayati Raj?',
            options: ['42nd Amendment', '52nd Amendment', '73rd Amendment', '74th Amendment'],
            correctAnswer: 2,
            explanation: 'The 73rd Constitutional Amendment Act, 1992, gave constitutional status to Panchayati Raj institutions.'
          },
          {
            question: 'What is the minimum age to vote in Panchayat elections?',
            options: ['18 years', '21 years', '25 years', 'Varies by state'],
            correctAnswer: 0,
            explanation: 'The minimum age to vote in Panchayat elections is 18 years, same as other elections in India.'
          },
          {
            question: 'Which amendment deals with Municipalities?',
            options: ['42nd Amendment', '52nd Amendment', '73rd Amendment', '74th Amendment'],
            correctAnswer: 3,
            explanation: 'The 74th Constitutional Amendment Act, 1992, gave constitutional status to urban local bodies (Municipalities).'
          },
          {
            question: 'How often are Panchayat elections held?',
            options: ['Every 3 years', 'Every 4 years', 'Every 5 years', 'Every 6 years'],
            correctAnswer: 2,
            explanation: 'Panchayat elections are held every 5 years in India.'
          }
        ],
        tags: ['state-elections', 'panchayat', 'local-bodies'],
        isActive: true
      }
    ];

    for (const quizData of quizzes) {
      const quiz = new Quiz(quizData);
      await quiz.save();
    }

    console.log('Created Indian election quizzes');

    // Create Indian election content
    const content = [
      {
        title: 'How to Register as a Voter in India',
        slug: 'how-to-register-voter-india',
        excerpt: 'A comprehensive guide to voter registration in India.',
        content: `# How to Register as a Voter in India

Registering to vote is the first step in participating in India's democracy. Here's everything you need to know:

## Eligibility Requirements

To register as a voter in India, you must:
- Be a citizen of India
- Be at least 18 years old on the qualifying date (January 1st of the year)
- Be ordinarily resident of the constituency where you want to register
- Not be disqualified under any law

## How to Register

### Online Registration
1. Visit the National Voters' Service Portal (nvsp.in)
2. Click on "Register as a New Voter" (Form 6)
3. Fill in your details
4. Upload required documents
5. Submit the form

### Offline Registration
1. Download Form 6 from nvsp.in
2. Fill the form completely
3. Attach required documents
4. Submit to your local Electoral Registration Officer (ERO)

## Required Documents

You'll need:
- Proof of identity (Aadhaar, PAN Card, Passport, etc.)
- Proof of address (Ration Card, Utility Bill, Bank Statement, etc.)
- Recent passport-size photograph
- Date of birth proof

## Important Dates

- **Qualifying Date**: January 1st of each year
- **Special Summary Revision**: Usually conducted annually (October-November)
- **Continuous Registration**: Available throughout the year

## After Registration

- Your application will be verified by the ERO
- Field verification may be conducted
- Once approved, your name will be added to the electoral roll
- You will receive your Voter ID Card (EPIC) by post
- You can check your status online at nvsp.in

## Voter ID Card (EPIC)

The Electors Photo Identity Card (EPIC) is:
- A photo identity card issued by the Election Commission
- The primary document for voting
- Free of cost
- Valid across India

## Check Your Registration

You can verify your voter registration:
- Online at nvsp.in
- Through the Voter Helpline App
- By SMS: Send EPIC <EPIC Number> to 166 or 51969
- At your local ERO office`,
        category: 'voting-basics',
        tags: ['registration', 'voter-id', 'epic'],
        difficulty: 'beginner',
        readTime: 5,
        authorName: 'ElectEdu Team',
        featured: true,
        isPublished: true
      },
      {
        title: 'Understanding India\'s Electoral System',
        slug: 'understanding-indian-electoral-system',
        excerpt: 'Learn how India\'s electoral system works and the role of various institutions.',
        content: `# Understanding India's Electoral System

India has the world's largest democracy with a complex but well-structured electoral system.

## The Election Commission of India

The Election Commission of India (ECI) is an autonomous constitutional authority responsible for:
- Conducting free and fair elections
- Supervising the electoral process
- Preparing and updating electoral rolls
- Allotting election symbols to political parties
- Enforcing the Model Code of Conduct

### Composition
- Chief Election Commissioner (CEC)
- Two Election Commissioners
- All have equal powers and receive equal salary

## Types of Elections

### Lok Sabha Elections (General Elections)
- Held every 5 years
- 543 constituencies across India
- First Past the Post (FPTP) system
- Elects members to the lower house of Parliament

### Rajya Sabha Elections
- Indirect elections by State Legislative Assemblies
- Uses Single Transferable Vote (STV) system
- One-third members retire every 2 years
- Members serve 6-year terms

### State Legislative Assembly Elections (Vidhan Sabha)
- Held every 5 years in each state
- FPTP system
- Elects members to state legislatures

### Local Body Elections
- Panchayat elections (rural areas)
- Municipal elections (urban areas)
- Held every 5 years

## Electoral Process

### 1. Announcement
- Election Commission announces election dates
- Model Code of Conduct comes into effect

### 2. Nomination
- Candidates file nomination papers
- Scrutiny of nominations
- Withdrawal of candidature

### 3. Campaigning
- Political parties and candidates campaign
- Subject to Model Code of Conduct
- Expenditure limits apply

### 4. Polling
- Voting through Electronic Voting Machines (EVMs)
- VVPAT (Voter Verifiable Paper Audit Trail) for transparency
- Polling agents monitor the process

### 5. Counting
- Votes counted on a designated day
- Observed by candidates and their agents
- Results declared constituency-wise

## Key Features

### Electronic Voting Machines (EVMs)
- Used since 2004 for all elections
- Faster, more accurate, and eco-friendly
- Two units: Control Unit and Balloting Unit

### VVPAT
- Provides paper trail for verification
- Allows voters to verify their vote
- Used for random verification

### NOTA (None of the Above)
- Introduced in 2013
- Allows voters to reject all candidates
- Ensures right to negative voting

### Model Code of Conduct
- Guidelines for political parties and candidates
- Ensures level playing field
- Enforced from announcement to results

## Representation

### Reserved Constituencies
- Scheduled Castes (SCs): 84 seats in Lok Sabha
- Scheduled Tribes (STs): 47 seats in Lok Sabha
- Proportional to population

### Women's Representation
- No reserved seats in Parliament currently
- 33% reservation in Panchayats and Municipalities
- Women's Reservation Bill pending

## Electoral Reforms

Recent reforms include:
- Introduction of VVPAT
- Online voter registration
- Voter Helpline App
- Accessible polling stations
- Postal ballot for senior citizens and PwDs`,
        category: 'electoral-system',
        tags: ['eci', 'elections', 'system'],
        difficulty: 'intermediate',
        readTime: 10,
        authorName: 'ElectEdu Team',
        featured: true,
        isPublished: true
      },
      {
        title: 'Types of Elections in India',
        slug: 'types-of-elections-india',
        excerpt: 'Explore the different types of elections held in India.',
        content: `# Types of Elections in India

India conducts various types of elections at different levels of government.

## Parliamentary Elections

### Lok Sabha Elections (General Elections)
- **Frequency**: Every 5 years
- **Seats**: 543 (plus 2 nominated)
- **System**: First Past the Post (FPTP)
- **Eligibility to Vote**: 18 years and above
- **Eligibility to Contest**: 25 years and above

### Rajya Sabha Elections
- **Frequency**: Continuous (1/3rd every 2 years)
- **Seats**: 245 (233 elected, 12 nominated)
- **System**: Single Transferable Vote (STV)
- **Elected by**: State Legislative Assembly members

## State Elections

### Vidhan Sabha (Legislative Assembly)
- **Frequency**: Every 5 years
- **System**: FPTP
- **Eligibility to Vote**: 18 years and above
- **Eligibility to Contest**: 25 years and above

### Vidhan Parishad (Legislative Council)
- **Frequency**: Continuous (1/3rd every 2 years)
- **System**: STV
- **Present in**: 6 states (Andhra Pradesh, Bihar, Karnataka, Maharashtra, Telangana, Uttar Pradesh)

## Local Body Elections

### Panchayati Raj (Rural)
- **Gram Panchayat**: Village level
- **Panchayat Samiti**: Block level
- **Zila Parishad**: District level
- **Frequency**: Every 5 years
- **Reservation**: 33% for women, SC/ST as per population

### Urban Local Bodies
- **Municipal Corporation**: Large cities
- **Municipality**: Smaller cities
- **Nagar Panchayat**: Transitional areas
- **Frequency**: Every 5 years
- **Reservation**: 33% for women, SC/ST as per population

## Special Elections

### By-Elections
- Held to fill vacant seats
- Conducted within 6 months of vacancy
- Same rules as general elections

### Presidential Election
- **Elected by**: Electoral College
- **Electoral College**: Elected members of Parliament and State Legislatures
- **System**: Single Transferable Vote
- **Term**: 5 years

### Vice-Presidential Election
- **Elected by**: Electoral College
- **Electoral College**: Members of both Houses of Parliament
- **System**: Single Transferable Vote
- **Term**: 5 years

## Election Schedule

### General Elections
- Held in multiple phases
- Usually 7-9 phases over 1-2 months
- Allows deployment of security forces

### State Elections
- Can be held with general elections
- Or separately as per state schedule
- May be held in multiple phases

## Why Every Election Matters

- **Lok Sabha**: Forms central government, makes national laws
- **Vidhan Sabha**: Forms state government, makes state laws
- **Panchayat/Municipality**: Directly impacts local development
- **Rajya Sabha**: Reviews and amends legislation

## Voter Turnout

India has seen increasing voter turnout:
- 1952: 45.7%
- 2019: 67.4%
- Higher turnout in recent elections shows growing democratic participation`,
        category: 'electoral-system',
        tags: ['elections', 'types', 'india'],
        difficulty: 'beginner',
        readTime: 8,
        authorName: 'ElectEdu Team',
        featured: false,
        isPublished: true
      }
    ];

    for (const contentData of content) {
      const contentItem = new Content(contentData);
      await contentItem.save();
    }

    console.log('Created Indian election content');

    // Create Indian election timeline events
    const timelineEvents = [
      {
        title: 'Lok Sabha Elections 2029 - Announcement',
        description: 'Election Commission announces schedule for Lok Sabha elections',
        date: new Date('2029-03-01'),
        category: 'election',
        status: 'upcoming',
        importance: 'critical',
        details: 'The Election Commission of India will announce the complete schedule for the 19th Lok Sabha elections, including polling dates, phases, and counting day.',
        location: 'India',
        isActive: true
      },
      {
        title: 'Voter Registration Drive',
        description: 'Special campaign for new voter registration',
        date: new Date('2026-09-01'),
        category: 'registration',
        status: 'upcoming',
        importance: 'high',
        details: 'Special drive to register new voters, especially youth turning 18. Visit nvsp.in or your nearest ERO office.',
        location: 'Nationwide',
        isActive: true
      },
      {
        title: 'Electoral Roll Revision 2026',
        description: 'Annual revision of electoral rolls begins',
        date: new Date('2026-10-01'),
        category: 'registration',
        status: 'upcoming',
        importance: 'high',
        details: 'Summary revision of electoral rolls. Citizens can check, add, delete, or modify their details in the voter list.',
        location: 'Nationwide',
        isActive: true
      },
      {
        title: 'State Assembly Elections - Phase 1',
        description: 'First phase of state assembly elections',
        date: new Date('2026-11-15'),
        category: 'election',
        status: 'upcoming',
        importance: 'high',
        details: 'First phase of polling for state legislative assembly elections in multiple states.',
        location: 'Multiple States',
        isActive: true
      },
      {
        title: 'National Voters Day',
        description: 'Celebration of National Voters Day',
        date: new Date('2027-01-25'),
        category: 'results',
        status: 'upcoming',
        importance: 'medium',
        details: 'National Voters Day is celebrated on January 25th every year to encourage young voters to participate in the electoral process.',
        location: 'Nationwide',
        isActive: true
      },
      {
        title: 'Lok Sabha Elections 2029 - Phase 1',
        description: 'First phase of Lok Sabha elections',
        date: new Date('2029-04-15'),
        category: 'voting',
        status: 'upcoming',
        importance: 'critical',
        details: 'First phase of polling for the 19th Lok Sabha elections. Check your polling booth location and timings.',
        location: 'Multiple States',
        isActive: true
      },
      {
        title: 'Lok Sabha Elections 2029 - Final Phase',
        description: 'Last phase of Lok Sabha elections',
        date: new Date('2029-05-20'),
        category: 'voting',
        status: 'upcoming',
        importance: 'critical',
        details: 'Final phase of polling for the 19th Lok Sabha elections.',
        location: 'Multiple States',
        isActive: true
      },
      {
        title: 'Lok Sabha Elections 2029 - Counting Day',
        description: 'Counting of votes and declaration of results',
        date: new Date('2029-05-23'),
        category: 'results',
        status: 'upcoming',
        importance: 'critical',
        details: 'Counting of votes for all Lok Sabha constituencies. Results will be declared constituency-wise throughout the day.',
        location: 'Nationwide',
        isActive: true
      }
    ];

    for (const eventData of timelineEvents) {
      const event = new Timeline(eventData);
      await event.save();
    }

    console.log('Created Indian election timeline events');

    // Create Indian election FAQs
    const faqs = [
      {
        question: 'Do I need to carry my Voter ID card to vote?',
        answer: 'While the Voter ID card (EPIC) is the preferred document, you can also use other photo identity documents like Aadhaar card, Passport, Driving License, PAN Card, Service Identity Card, Passbook with photograph issued by Bank/Post Office, Health Insurance Smart Card, MGNREGA Job Card, or Pension document with photograph.',
        category: 'voting-process',
        tags: ['voter-id', 'documents', 'voting']
      },
      {
        question: 'Can I vote if I recently moved to a new city?',
        answer: 'If you have moved to a new city, you need to get your name deleted from the old constituency and register in the new constituency. You can do this online through nvsp.in by filling Form 7 (deletion) and Form 6 (new registration). You need to provide proof of your new address.',
        category: 'registration',
        tags: ['moving', 'registration', 'address']
      },
      {
        question: 'What is NOTA and how does it work?',
        answer: 'NOTA (None of the Above) is an option on the EVM that allows voters to officially register a vote of rejection for all candidates. While NOTA votes are counted, they do not affect the election outcome - the candidate with the most votes still wins. However, it allows citizens to express dissatisfaction with all candidates.',
        category: 'voting-process',
        tags: ['nota', 'voting', 'options']
      },
      {
        question: 'How can I find my polling booth?',
        answer: 'You can find your polling booth location by: 1) Visiting nvsp.in and searching with your EPIC number or details, 2) Using the Voter Helpline App, 3) Sending SMS "EPIC <your EPIC number>" to 166 or 51969, 4) Checking your Voter ID card which mentions the polling station, or 5) Contacting your local ERO office.',
        category: 'voting-process',
        tags: ['polling-booth', 'location', 'voting']
      },
      {
        question: 'Can I vote if I am away from my registered constituency?',
        answer: 'If you are away from your registered constituency, you have limited options. You can apply for postal ballot if you are a service voter (armed forces, state police, government employees on election duty) or are above 80 years or a Person with Disability. Otherwise, you need to be present in your registered constituency to vote.',
        category: 'voting-process',
        tags: ['postal-ballot', 'absence', 'voting']
      }
    ];

    for (const faqData of faqs) {
      const faq = new FAQ(faqData);
      await faq.save();
    }

    console.log('Created Indian election FAQs');

    // Create site settings
    const settings = [
      {
        key: 'site_title',
        value: 'ElectEdu - Indian Election Education Assistant',
        type: 'string',
        description: 'Main site title',
        category: 'general',
        isPublic: true
      },
      {
        key: 'site_description',
        value: 'Learn about Indian elections, voting, and democracy with our AI-powered education platform.',
        type: 'string',
        description: 'Site description for SEO',
        category: 'general',
        isPublic: true
      },
      {
        key: 'contact_email',
        value: 'contact@electedu.com',
        type: 'string',
        description: 'Contact email address',
        category: 'contact',
        isPublic: true
      },
      {
        key: 'enable_registration',
        value: true,
        type: 'boolean',
        description: 'Allow new user registration',
        category: 'auth',
        isPublic: true
      }
    ];

    for (const settingData of settings) {
      const setting = new SiteSettings(settingData);
      await setting.save();
    }

    console.log('Created site settings');

    console.log('✅ Indian election database seeded successfully!');
    console.log('Admin credentials: admin@electedu.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedIndianData();
