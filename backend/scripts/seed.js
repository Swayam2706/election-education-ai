require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Content = require('../models/Content');
const Timeline = require('../models/Timeline');
const FAQ = require('../models/FAQ');
const SiteSettings = require('../models/SiteSettings');

const seedData = async () => {
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
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'USER'
      },
      {
        email: 'jane@example.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'USER'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log('Created users');

    // Create sample quizzes
    const quizzes = [
      {
        title: 'Voting Basics Quiz',
        description: 'Test your knowledge of fundamental voting concepts and procedures',
        category: 'voting-basics',
        difficulty: 'beginner',
        timeLimit: 600,
        passingScore: 70,
        questions: [
          {
            question: 'What is the minimum age to vote in federal elections in the United States?',
            options: ['16 years old', '18 years old', '21 years old', '25 years old'],
            correctAnswer: 1,
            explanation: 'The 26th Amendment to the U.S. Constitution, ratified in 1971, lowered the voting age to 18 for all elections.'
          },
          {
            question: 'How often are U.S. presidential elections held?',
            options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 6 years'],
            correctAnswer: 2,
            explanation: 'Presidential elections are held every four years on the first Tuesday after the first Monday in November.'
          },
          {
            question: 'What is required to vote in most states?',
            options: ['Driver\'s license', 'Voter registration', 'Property ownership', 'College degree'],
            correctAnswer: 1,
            explanation: 'Voter registration is required in most states, though the specific requirements and deadlines vary by state.'
          },
          {
            question: 'When is Election Day for federal elections?',
            options: ['First Monday in November', 'First Tuesday in November', 'First Tuesday after the first Monday in November', 'Last Tuesday in October'],
            correctAnswer: 2,
            explanation: 'Federal Election Day is the first Tuesday after the first Monday in November, as established by federal law in 1845.'
          },
          {
            question: 'What is a primary election?',
            options: ['The final election', 'An election to choose party nominees', 'An election for local offices only', 'A special election'],
            correctAnswer: 1,
            explanation: 'Primary elections are held to determine which candidates will represent each political party in the general election.'
          }
        ],
        tags: ['voting', 'basics', 'democracy'],
        isActive: true
      },
      {
        title: 'Electoral College Deep Dive',
        slug: 'electoral-college-quiz',
        description: 'Test your understanding of the Electoral College system',
        category: 'electoral-system',
        difficulty: 'intermediate',
        timeLimit: 900,
        passingScore: 70,
        questions: [
          {
            question: 'How many electoral votes are there in total?',
            options: ['435', '538', '550', '600'],
            correctAnswer: 1,
            explanation: 'There are 538 total electoral votes, corresponding to 435 House seats, 100 Senate seats, and 3 votes for Washington D.C.'
          },
          {
            question: 'How many electoral votes does a candidate need to win the presidency?',
            options: ['250', '269', '270', '300'],
            correctAnswer: 2,
            explanation: 'A candidate needs 270 electoral votes to win the presidency, which is a simple majority of the 538 total votes.'
          },
          {
            question: 'Which states do NOT use a winner-take-all system for electoral votes?',
            options: ['California and Texas', 'Maine and Nebraska', 'Florida and Ohio', 'New York and Pennsylvania'],
            correctAnswer: 1,
            explanation: 'Maine and Nebraska use a proportional system, awarding electoral votes by congressional district plus two for the statewide winner.'
          },
          {
            question: 'When do electors officially cast their votes?',
            options: ['On Election Day in November', 'In December after the election', 'In January during inauguration', 'In October before the election'],
            correctAnswer: 1,
            explanation: 'Electors meet in their respective state capitals in December to formally cast their electoral votes.'
          },
          {
            question: 'What happens if no candidate receives 270 electoral votes?',
            options: ['A runoff election is held', 'The popular vote winner becomes president', 'The House of Representatives chooses the president', 'The current president remains in office'],
            correctAnswer: 2,
            explanation: 'If no candidate receives a majority of electoral votes, the House of Representatives chooses the president, with each state delegation having one vote.'
          }
        ],
        tags: ['electoral-college', 'president', 'system'],
        isActive: true
      },
      {
        title: 'Voting Rights History',
        slug: 'voting-rights-history-quiz',
        description: 'Learn about the evolution of voting rights in America',
        category: 'history',
        difficulty: 'intermediate',
        timeLimit: 900,
        passingScore: 70,
        questions: [
          {
            question: 'Which amendment gave women the right to vote?',
            options: ['15th Amendment', '19th Amendment', '24th Amendment', '26th Amendment'],
            correctAnswer: 1,
            explanation: 'The 19th Amendment, ratified in 1920, prohibited denying the right to vote based on sex, granting women the right to vote.'
          },
          {
            question: 'What did the 15th Amendment accomplish?',
            options: ['Gave women the right to vote', 'Lowered the voting age to 18', 'Prohibited denial of voting rights based on race', 'Eliminated poll taxes'],
            correctAnswer: 2,
            explanation: 'The 15th Amendment, ratified in 1870, prohibited denying voting rights based on race, color, or previous condition of servitude.'
          },
          {
            question: 'Which act outlawed discriminatory voting practices like literacy tests?',
            options: ['Civil Rights Act of 1964', 'Voting Rights Act of 1965', 'Americans with Disabilities Act', 'National Voter Registration Act'],
            correctAnswer: 1,
            explanation: 'The Voting Rights Act of 1965 outlawed discriminatory voting practices and dramatically increased minority voter registration.'
          },
          {
            question: 'What did the 26th Amendment do?',
            options: ['Gave women the right to vote', 'Eliminated poll taxes', 'Lowered the voting age to 18', 'Allowed direct election of senators'],
            correctAnswer: 2,
            explanation: 'The 26th Amendment, ratified in 1971, lowered the voting age from 21 to 18, largely in response to the Vietnam War.'
          },
          {
            question: 'Which amendment eliminated poll taxes in federal elections?',
            options: ['15th Amendment', '19th Amendment', '24th Amendment', '26th Amendment'],
            correctAnswer: 2,
            explanation: 'The 24th Amendment, ratified in 1964, prohibited poll taxes in federal elections, removing an economic barrier to voting.'
          }
        ],
        tags: ['voting-rights', 'history', 'amendments'],
        isActive: true
      },
      {
        title: 'Congressional Elections',
        slug: 'congressional-elections-quiz',
        description: 'Test your knowledge about House and Senate elections',
        category: 'electoral-system',
        difficulty: 'intermediate',
        timeLimit: 600,
        passingScore: 70,
        questions: [
          {
            question: 'How many senators does each state have?',
            options: ['1', '2', '3', 'Depends on population'],
            correctAnswer: 1,
            explanation: 'Each state has exactly 2 senators, regardless of population, for a total of 100 senators in the U.S. Senate.'
          },
          {
            question: 'How long is a term for a U.S. Senator?',
            options: ['2 years', '4 years', '6 years', '8 years'],
            correctAnswer: 2,
            explanation: 'U.S. Senators serve 6-year terms, with approximately one-third of the Senate up for election every 2 years.'
          },
          {
            question: 'How many members are in the House of Representatives?',
            options: ['100', '435', '538', '535'],
            correctAnswer: 1,
            explanation: 'The House of Representatives has 435 voting members, with representation based on state population.'
          },
          {
            question: 'How long is a term for a U.S. Representative?',
            options: ['1 year', '2 years', '4 years', '6 years'],
            correctAnswer: 1,
            explanation: 'U.S. Representatives serve 2-year terms, meaning all House seats are up for election every 2 years.'
          },
          {
            question: 'What are midterm elections?',
            options: ['Elections held in the middle of the year', 'Elections held halfway through a presidential term', 'Primary elections', 'Special elections'],
            correctAnswer: 1,
            explanation: 'Midterm elections occur halfway through a presidential term and include all House seats and one-third of Senate seats.'
          }
        ],
        tags: ['congress', 'senate', 'house'],
        isActive: true
      }
    ];

    for (const quizData of quizzes) {
      const quiz = new Quiz(quizData);
      await quiz.save();
    }

    console.log('Created quizzes');

    // Create sample content
    const content = [
      {
        title: 'How to Register to Vote',
        slug: 'how-to-register-to-vote',
        excerpt: 'A comprehensive guide to voter registration in the United States.',
        content: `# How to Register to Vote

Registering to vote is the first step in participating in democracy. Here's everything you need to know:

## Eligibility Requirements

To register to vote, you must:
- Be a U.S. citizen
- Be at least 18 years old (16-17 in some states for pre-registration)
- Meet your state's residency requirements
- Not be disqualified due to a felony conviction (varies by state)

## How to Register

1. **Online**: Most states offer online registration at vote.gov
2. **By mail**: Download and mail a voter registration form
3. **In person**: Visit your local election office or DMV
4. **Automatic**: Some states automatically register eligible citizens

## Required Information

You'll typically need:
- Full legal name
- Home address
- Date of birth
- Driver's license or state ID number
- Social Security number (last 4 digits)

## Important Deadlines

Registration deadlines vary by state, typically 15-30 days before an election. Some states offer same-day registration.

## Next Steps

After registering:
- Verify your registration status online
- Learn about your voting options (in-person, early, absentee)
- Research candidates and issues
- Make a plan to vote on Election Day`,
        category: 'voting-basics',
        tags: ['registration', 'voting', 'democracy'],
        difficulty: 'beginner',
        readTime: 5,
        authorName: 'ElectEdu Team',
        featured: true,
        isPublished: true
      },
      {
        title: 'Understanding the Electoral College',
        slug: 'understanding-electoral-college',
        excerpt: 'Learn how the Electoral College works and its role in presidential elections.',
        content: `# Understanding the Electoral College

The Electoral College is a unique system used to elect the President and Vice President of the United States.

## What is the Electoral College?

The Electoral College consists of 538 electors who formally elect the President and Vice President. Each state gets a number of electors equal to its total number of senators and representatives in Congress.

## How It Works

1. **Popular Vote**: Citizens vote for their preferred candidate in November
2. **State Results**: Most states award all electoral votes to the candidate who wins the popular vote in that state
3. **Electoral Vote**: Electors meet in December to formally cast their votes
4. **Congressional Count**: Congress counts the electoral votes in January

## Key Facts

- **Total Electors**: 538 (435 House + 100 Senate + 3 D.C.)
- **Majority Needed**: 270 electoral votes to win
- **Winner-Take-All**: Used by 48 states and D.C.
- **Proportional**: Maine and Nebraska split their electoral votes by congressional district

## Historical Context

The Electoral College was established by the Founding Fathers as a compromise between election by Congress and popular vote. It was designed to balance the influence of large and small states.

## Criticism and Support

**Critics argue**:
- Can result in popular vote winner losing the presidency
- Gives disproportionate power to smaller states
- Focuses campaigns on swing states only
- Discourages voter turnout in non-competitive states

**Supporters argue**:
- Protects influence of smaller states
- Maintains federalism and state sovereignty
- Encourages broad geographic coalitions
- Prevents regional candidates from winning`,
        category: 'electoral-system',
        tags: ['electoral-college', 'president', 'system'],
        difficulty: 'intermediate',
        readTime: 8,
        authorName: 'ElectEdu Team',
        featured: true,
        isPublished: true
      },
      {
        title: 'Types of Elections in the United States',
        slug: 'types-of-elections',
        excerpt: 'Explore the different types of elections held in the U.S., from presidential to local races.',
        content: `# Types of Elections in the United States

The United States holds various types of elections at different levels of government. Understanding these elections helps you participate fully in democracy.

## Federal Elections

### Presidential Elections
- Held every 4 years
- Elect the President and Vice President
- Use the Electoral College system
- Next election: November 2024

### Congressional Elections
- **Senate**: 1/3 of seats every 2 years (6-year terms)
- **House of Representatives**: All 435 seats every 2 years
- Midterm elections occur between presidential elections

## State Elections

### Gubernatorial Elections
- Elect state governors
- Most states hold elections every 4 years
- Timing varies by state

### State Legislature
- State senators and representatives
- Create state laws and budgets
- Terms vary by state (2-4 years)

## Local Elections

### Municipal Elections
- Mayors, city council members
- School board members
- Often held in odd-numbered years

### Special Elections
- Fill vacant positions
- Vote on specific issues or ballot measures
- Can occur at any time

## Primary Elections

### Purpose
- Determine party nominees for general election
- Voters choose between candidates from same party

### Types
- **Closed Primary**: Only registered party members can vote
- **Open Primary**: Any registered voter can participate
- **Semi-Closed**: Allows independents to choose a party primary

## General Elections

- Final election where nominees compete
- Held on first Tuesday after first Monday in November
- Determines who takes office

## Special Ballot Measures

### Initiatives
- Citizens propose new laws
- Require signature gathering
- Voted on directly by citizens

### Referendums
- Legislature refers measures to voters
- Can approve or reject laws
- Common for constitutional amendments

## Why Every Election Matters

- Local elections often have the most direct impact on daily life
- Lower turnout means your vote counts more
- Many important decisions happen at state and local levels
- Building blocks for national political careers`,
        category: 'electoral-system',
        tags: ['elections', 'government', 'democracy'],
        difficulty: 'beginner',
        readTime: 7,
        authorName: 'ElectEdu Team',
        featured: false,
        isPublished: true
      },
      {
        title: 'Voting Rights and History',
        slug: 'voting-rights-history',
        excerpt: 'The evolution of voting rights in America, from the founding to today.',
        content: `# Voting Rights and History

The right to vote in America has expanded dramatically over time through constitutional amendments, legislation, and court decisions.

## Early America (1776-1860s)

### Original Restrictions
- Only white male property owners could vote
- Represented about 6% of the population
- States controlled voting qualifications

### Gradual Expansion
- Property requirements slowly eliminated
- By 1850s, most white men could vote
- Women, minorities still excluded

## Post-Civil War Era

### 15th Amendment (1870)
- Prohibited denial of voting rights based on race
- Aimed to protect formerly enslaved people
- Southern states found ways to circumvent it

### Jim Crow Era
- Poll taxes
- Literacy tests
- Grandfather clauses
- Violence and intimidation

## Women's Suffrage

### 19th Amendment (1920)
- Granted women the right to vote
- Result of decades of activism
- Culmination of suffrage movement

### Key Figures
- Susan B. Anthony
- Elizabeth Cady Stanton
- Alice Paul

## Civil Rights Era

### 24th Amendment (1964)
- Banned poll taxes in federal elections
- Removed economic barrier to voting

### Voting Rights Act (1965)
- Outlawed discriminatory voting practices
- Required federal approval for voting changes in certain areas
- Dramatically increased minority voter registration

## Modern Expansions

### 26th Amendment (1971)
- Lowered voting age from 21 to 18
- Response to Vietnam War draft age

### Americans with Disabilities Act (1990)
- Required accessible polling places
- Ensured voting rights for disabled citizens

### National Voter Registration Act (1993)
- "Motor Voter" law
- Made registration easier and more accessible

## Ongoing Challenges

### Current Issues
- Voter ID laws
- Gerrymandering
- Voting access and convenience
- Felon disenfranchisement
- Election security

### Advocacy and Protection
- Continued work to protect voting rights
- Efforts to increase voter participation
- Debates over election procedures

## The Importance of Voting Rights

Voting rights represent the foundation of democracy. Every expansion of voting rights has made America more representative and democratic. Understanding this history helps us appreciate and protect these hard-won rights.`,
        category: 'history',
        tags: ['voting-rights', 'history', 'civil-rights'],
        difficulty: 'intermediate',
        readTime: 10,
        authorName: 'ElectEdu Team',
        featured: true,
        isPublished: true
      },
      {
        title: 'How to Research Candidates and Issues',
        slug: 'research-candidates-issues',
        excerpt: 'A practical guide to becoming an informed voter through effective research.',
        content: `# How to Research Candidates and Issues

Being an informed voter means researching candidates and ballot measures before Election Day. Here's how to do it effectively.

## Finding Reliable Information

### Official Sources
- **Candidate websites**: Direct information about positions
- **Government websites**: Nonpartisan voter guides
- **League of Women Voters**: Comprehensive voter guides
- **Ballotpedia**: Detailed information on candidates and measures

### News Sources
- Read multiple sources with different perspectives
- Look for fact-checking organizations
- Distinguish between news and opinion pieces
- Check publication dates for current information

## Researching Candidates

### Key Areas to Investigate

**1. Policy Positions**
- What are their stated positions on key issues?
- How detailed are their policy proposals?
- Have their positions changed over time?

**2. Experience and Qualifications**
- What relevant experience do they have?
- What is their professional background?
- Have they held elected office before?

**3. Voting Record**
- How did they vote on important issues?
- Do their votes match their stated positions?
- What bills have they sponsored or supported?

**4. Endorsements**
- Who supports this candidate?
- What organizations have endorsed them?
- What do these endorsements tell you?

**5. Campaign Finance**
- Who is funding their campaign?
- Are there potential conflicts of interest?
- How much are they spending?

## Evaluating Ballot Measures

### Understanding Propositions

**Read the Full Text**
- Don't rely only on summaries
- Understand what the measure actually does
- Look for unintended consequences

**Consider Multiple Perspectives**
- Who supports and opposes the measure?
- What are their arguments?
- Who benefits and who might be harmed?

**Research the Impact**
- What are the fiscal implications?
- How will it affect your community?
- What happens if it passes or fails?

## Avoiding Misinformation

### Red Flags
- Extreme or emotional language
- Lack of sources or citations
- Claims that seem too good/bad to be true
- Sharing without verification

### Fact-Checking Resources
- FactCheck.org
- PolitiFact
- Snopes
- AP Fact Check
- Reuters Fact Check

## Creating Your Voter Guide

### Personal Research Document

1. **List all races and measures on your ballot**
2. **Research each one systematically**
3. **Note your preliminary choices**
4. **Review before Election Day**
5. **Bring it to the polls if allowed**

### Sample Ballot
- Request a sample ballot from your election office
- Practice filling it out at home
- Reduces time and stress at polling place

## Discussion and Deliberation

### Talk to Others
- Discuss issues with friends and family
- Attend candidate forums and debates
- Join community discussions
- Listen to different perspectives

### Stay Open-Minded
- Be willing to change your mind
- Consider new information
- Respect different viewpoints
- Focus on issues, not personalities

## Making Your Decision

### Final Considerations
- Which issues matter most to you?
- Which candidate aligns with your values?
- Who do you trust to represent you?
- What kind of leadership do you want?

Remember: There's no perfect candidate. Vote for the person who best represents your priorities and values.

## After the Election

### Stay Engaged
- Hold elected officials accountable
- Contact them about important issues
- Attend town halls and public meetings
- Prepare for the next election

Being an informed voter is an ongoing responsibility, not just a once-every-few-years activity.`,
        category: 'voting-basics',
        tags: ['research', 'candidates', 'informed-voting'],
        difficulty: 'beginner',
        readTime: 12,
        authorName: 'ElectEdu Team',
        featured: false,
        isPublished: true
      },
      {
        title: 'Absentee and Mail-In Voting Guide',
        slug: 'absentee-mail-voting',
        excerpt: 'Everything you need to know about voting by mail and absentee ballots.',
        content: `# Absentee and Mail-In Voting Guide

Voting by mail provides a convenient alternative to in-person voting. Here's everything you need to know.

## What is Mail-In Voting?

### Absentee Voting
- Traditional system for voters who can't vote in person
- Requires an excuse in some states
- Must request a ballot

### Vote-By-Mail
- All registered voters automatically receive ballots
- No excuse needed
- Used by several states for all elections

## Eligibility and Requirements

### Who Can Vote By Mail?

**Universal Mail Voting States**
- California, Colorado, Hawaii, Nevada, Oregon, Utah, Vermont, Washington
- All voters automatically receive mail ballots

**No-Excuse Absentee States**
- Most states allow any voter to request absentee ballot
- No reason required

**Excuse-Required States**
- Limited number of states
- Must provide valid reason
- Common excuses: travel, illness, disability, military service

## How to Request an Absentee Ballot

### Step-by-Step Process

1. **Check Your State's Deadline**
   - Varies by state (typically 7-14 days before election)
   - Some states allow requests up to a year in advance

2. **Submit Your Request**
   - Online through state election website
   - By mail using official form
   - In person at election office
   - By phone in some states

3. **Provide Required Information**
   - Full name and address
   - Date of birth
   - Reason for absentee ballot (if required)
   - Signature

4. **Wait for Your Ballot**
   - Typically arrives 2-3 weeks before election
   - Track your ballot online in many states

## Completing Your Mail Ballot

### Important Steps

**1. Read All Instructions Carefully**
- Each state has specific requirements
- Follow directions exactly
- Don't skip any steps

**2. Use Correct Marking Method**
- Usually black or blue pen
- Fill in ovals completely
- Don't use X marks or checkmarks

**3. Complete Required Information**
- Sign the envelope (required!)
- Date if required
- Provide witness signature if required
- Include copy of ID if required

**4. Seal Properly**
- Use provided envelope
- Seal securely
- Don't add tape or stickers

## Returning Your Ballot

### Options for Return

**1. Mail**
- Use provided postage-paid envelope
- Mail early (at least 7-10 days before election)
- Get proof of mailing if possible
- Check if postmark or receipt deadline applies

**2. Drop Box**
- Secure, monitored ballot drop boxes
- Available 24/7 in many locations
- No postage needed
- Immediate confirmation

**3. In Person**
- Deliver to election office
- Drop off at polling place on Election Day
- Get receipt for your records

**4. Authorized Representative**
- Some states allow someone else to return your ballot
- Must follow specific rules
- Usually requires authorization form

## Tracking Your Ballot

### Ballot Tracking Systems
- Many states offer online tracking
- Receive notifications when:
  - Ballot is mailed to you
  - Ballot is received by election office
  - Ballot is accepted and counted
  - Issues with your ballot

### What to Do If There's a Problem
- Contact election office immediately
- May be able to fix signature issues
- Can vote in person if ballot not received
- Provisional ballot available as backup

## Common Mistakes to Avoid

### Ballot Rejection Reasons
1. **Missing or mismatched signature**
2. **Ballot received after deadline**
3. **Envelope not sealed properly**
4. **Missing required information**
5. **Damaged or altered ballot**
6. **Voting in person after requesting mail ballot**

### Prevention Tips
- Follow all instructions exactly
- Sign with your registered signature
- Return ballot early
- Track your ballot status
- Contact election office with questions

## Security and Integrity

### How Mail Voting is Secured

**Ballot Design**
- Unique barcodes
- Security features
- Tamper-evident envelopes

**Verification Process**
- Signature matching
- Barcode scanning
- Chain of custody tracking
- Bipartisan observation

**Fraud Prevention**
- Severe penalties for fraud
- Multiple verification steps
- Audit procedures
- Transparent processes

## Advantages of Mail Voting

### Benefits
- Vote on your own schedule
- Research candidates while voting
- No lines or wait times
- Accessible for people with disabilities
- Convenient for busy schedules
- Reduces Election Day crowding

## Planning Ahead

### Timeline
- **6-8 weeks before**: Request ballot
- **3-4 weeks before**: Receive ballot
- **1-2 weeks before**: Complete and return ballot
- **Election Day**: Deadline for receipt (varies by state)

### Checklist
- ☐ Check if you're registered
- ☐ Request absentee ballot
- ☐ Receive ballot in mail
- ☐ Read all instructions
- ☐ Complete ballot carefully
- ☐ Sign envelope
- ☐ Return ballot early
- ☐ Track ballot status
- ☐ Confirm ballot was counted

Mail voting is a secure, convenient way to participate in elections. Plan ahead and follow instructions carefully to ensure your vote counts!`,
        category: 'voting-basics',
        tags: ['mail-voting', 'absentee', 'voting-methods'],
        difficulty: 'beginner',
        readTime: 15,
        authorName: 'ElectEdu Team',
        featured: false,
        isPublished: true
      }
    ];

    for (const contentData of content) {
      const contentItem = new Content(contentData);
      await contentItem.save();
    }

    console.log('Created content');

    // Create timeline events
    const timelineEvents = [
      {
        title: 'Voter Registration Deadline - Primary Elections',
        description: 'Last day to register to vote for the primary elections',
        date: new Date('2026-05-15'),
        category: 'registration',
        status: 'upcoming',
        importance: 'critical',
        details: 'Make sure you are registered to vote before this deadline. Check your state\'s specific requirements for primary elections.',
        location: 'Nationwide',
        requirements: ['Valid ID', 'Proof of residence', 'Completed registration form']
      },
      {
        title: 'Primary Elections',
        description: 'State primary elections to select party nominees',
        date: new Date('2026-06-02'),
        category: 'election',
        status: 'upcoming',
        importance: 'high',
        details: 'Primary elections determine which candidates will represent each party in the general election. Check your state\'s primary date as it may vary.',
        location: 'Various States'
      },
      {
        title: 'Voter Registration Deadline - General Election',
        description: 'Last day to register to vote for the general election',
        date: new Date('2026-10-05'),
        category: 'registration',
        status: 'upcoming',
        importance: 'critical',
        details: 'Final deadline to register for the November general election. Some states offer same-day registration.',
        location: 'Nationwide',
        requirements: ['Valid ID', 'Proof of residence', 'Completed registration form']
      },
      {
        title: 'Early Voting Begins',
        description: 'Early voting period starts in participating states',
        date: new Date('2026-10-19'),
        category: 'voting',
        status: 'upcoming',
        importance: 'high',
        details: 'Early voting allows you to cast your ballot before Election Day. Check if your state offers early voting and find your early voting location.',
        location: 'Participating States'
      },
      {
        title: 'Absentee Ballot Request Deadline',
        description: 'Last day to request an absentee ballot by mail',
        date: new Date('2026-10-23'),
        category: 'voting',
        status: 'upcoming',
        importance: 'high',
        details: 'If you plan to vote by mail, make sure to request your absentee ballot before this deadline. Deadlines vary by state.',
        location: 'Nationwide'
      },
      {
        title: 'General Election Day',
        description: 'Federal general election - polls open nationwide',
        date: new Date('2026-11-03'),
        category: 'election',
        status: 'upcoming',
        importance: 'critical',
        details: 'The official Election Day when all polling locations are open. Make sure you know your polling location, hours, and what to bring. Polls typically open 6-7 AM and close 7-8 PM.',
        location: 'Nationwide',
        requirements: ['Valid ID (varies by state)', 'Know your polling location']
      },
      {
        title: 'Absentee Ballot Return Deadline',
        description: 'Last day for absentee ballots to be received',
        date: new Date('2026-11-03'),
        category: 'voting',
        status: 'upcoming',
        importance: 'critical',
        details: 'Absentee ballots must be received by your election office by this date. Some states accept ballots postmarked by Election Day, but it\'s safer to return them early.',
        location: 'Nationwide'
      },
      {
        title: 'Election Results Certification',
        description: 'Official certification of election results',
        date: new Date('2026-12-08'),
        category: 'results',
        status: 'upcoming',
        importance: 'medium',
        details: 'States certify their election results after counting all ballots and resolving any challenges. This is when results become official.',
        location: 'State Level'
      },
      {
        title: 'Electoral College Vote',
        description: 'Electoral College members cast their votes for President',
        date: new Date('2026-12-14'),
        category: 'results',
        status: 'upcoming',
        importance: 'high',
        details: 'Electors meet in their respective state capitals to formally cast their votes for President and Vice President.',
        location: 'State Capitals'
      },
      {
        title: 'Congressional Certification of Electoral Votes',
        description: 'Congress counts and certifies Electoral College votes',
        date: new Date('2027-01-06'),
        category: 'results',
        status: 'upcoming',
        importance: 'high',
        details: 'Joint session of Congress to count electoral votes and officially declare the winner of the presidential election.',
        location: 'U.S. Capitol, Washington D.C.'
      },
      {
        title: 'Presidential Inauguration',
        description: 'Inauguration of the President and Vice President',
        date: new Date('2027-01-20'),
        category: 'results',
        status: 'upcoming',
        importance: 'high',
        details: 'The President-elect and Vice President-elect are sworn into office at the U.S. Capitol.',
        location: 'U.S. Capitol, Washington D.C.'
      }
    ];

    for (const eventData of timelineEvents) {
      const event = new Timeline(eventData);
      await event.save();
    }

    console.log('Created timeline events');

    // Create FAQs
    const faqs = [
      {
        question: 'Do I need to bring ID to vote?',
        answer: 'ID requirements vary by state. Some states require photo ID, others accept non-photo ID, and some states don\'t require ID at all. Check your state\'s specific requirements before heading to the polls.',
        category: 'voting-process',
        tags: ['ID', 'requirements', 'voting']
      },
      {
        question: 'Can I vote if I moved recently?',
        answer: 'If you moved within the same state, you may need to update your voter registration with your new address. If you moved to a different state, you\'ll need to register to vote in your new state. Check the registration deadlines for your new location.',
        category: 'registration',
        tags: ['moving', 'registration', 'address']
      },
      {
        question: 'What if I make a mistake on my ballot?',
        answer: 'If you make a mistake on your ballot, ask a poll worker for help. In most cases, you can request a new ballot. Don\'t try to correct the mistake yourself, as this might invalidate your ballot.',
        category: 'voting-process',
        tags: ['ballot', 'mistakes', 'help']
      },
      {
        question: 'How do I find my polling location?',
        answer: 'You can find your polling location by checking your voter registration card, visiting your state\'s Secretary of State website, or using online tools like Vote.gov. Your polling location is based on your registered address.',
        category: 'voting-process',
        tags: ['polling', 'location', 'address']
      }
    ];

    for (const faqData of faqs) {
      const faq = new FAQ(faqData);
      await faq.save();
    }

    console.log('Created FAQs');

    // Create site settings
    const settings = [
      {
        key: 'site_title',
        value: 'ElectEdu - Election Education Assistant',
        type: 'string',
        description: 'Main site title',
        category: 'general',
        isPublic: true
      },
      {
        key: 'site_description',
        value: 'Learn about elections, voting, and democracy with our AI-powered education platform.',
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

    console.log('✅ Database seeded successfully!');
    console.log('Admin credentials: admin@electedu.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
