const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Eligibility check
router.post('/check', [
  body('age').optional().isInt({ min: 16, max: 120 }),
  body('citizenship').optional().isIn(['citizen', 'non-citizen']),
  body('state').optional().isLength({ min: 2, max: 2 }),
  body('registrationStatus').optional().isIn(['registered', 'not-registered', 'unsure'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { age, citizenship, state, registrationStatus, felonyStatus, mentalCompetency } = req.body;

    let eligible = true;
    let reasons = [];
    let recommendations = [];
    let nextSteps = [];

    // Age check
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum < 18) {
        eligible = false;
        reasons.push('You must be at least 18 years old to vote in federal elections');
        if (ageNum >= 16) {
          recommendations.push('Good news! You can pre-register to vote in many states');
          recommendations.push(`You will be eligible to vote when you turn 18`);
          nextSteps.push('Check if your state offers pre-registration for 16-17 year olds');
        } else {
          nextSteps.push('You can register to vote when you turn 18');
        }
      } else {
        recommendations.push('✓ You meet the age requirement to vote');
      }
    }

    // Citizenship check
    if (citizenship) {
      if (citizenship === 'citizen') {
        recommendations.push('✓ You meet the citizenship requirement');
      } else {
        eligible = false;
        reasons.push('You must be a U.S. citizen to vote in federal elections');
        recommendations.push('Only U.S. citizens can vote in federal elections');
        if (citizenship === 'permanent-resident') {
          nextSteps.push('Consider applying for U.S. citizenship through naturalization');
          nextSteps.push('Visit uscis.gov for information about the naturalization process');
        }
      }
    }

    // Registration check
    if (registrationStatus) {
      if (registrationStatus === 'registered') {
        recommendations.push('✓ You are registered to vote');
        nextSteps.push('Verify your registration is up to date at vote.gov');
      } else if (registrationStatus === 'not-registered') {
        if (eligible && age >= 18 && citizenship === 'citizen') {
          reasons.push('You must register to vote before you can cast a ballot');
          nextSteps.push(`Register to vote in ${state || 'your state'} as soon as possible`);
          nextSteps.push('Visit vote.gov to register online or download a registration form');
          if (state) {
            nextSteps.push(`Check ${state} registration deadline - typically 15-30 days before election`);
          }
        }
      } else if (registrationStatus === 'unsure') {
        nextSteps.push('Check your voter registration status at vote.gov');
        nextSteps.push('If not registered, register as soon as possible');
      }
    }

    // Felony status check (state-specific rules apply)
    if (felonyStatus) {
      if (felonyStatus === 'currently-incarcerated') {
        eligible = false;
        reasons.push('Most states do not allow voting while incarcerated for a felony conviction');
        nextSteps.push('Your voting rights may be restored after completing your sentence');
        nextSteps.push(`Check ${state || 'your state'}'s laws about voting rights restoration`);
      } else if (felonyStatus === 'on-parole') {
        recommendations.push('Voting rights for people on parole vary by state');
        nextSteps.push(`Check ${state || 'your state'}'s specific rules for voting while on parole`);
        nextSteps.push('Some states restore voting rights immediately after release');
      } else if (felonyStatus === 'completed-sentence') {
        recommendations.push('Many states restore voting rights after sentence completion');
        nextSteps.push('Verify your voting rights have been restored in your state');
        nextSteps.push('You may need to re-register to vote');
      } else if (felonyStatus === 'none') {
        recommendations.push('✓ No felony conviction restrictions apply');
      }
    }

    // Mental competency (varies by state)
    if (mentalCompetency === 'court-determined-incompetent') {
      eligible = false;
      reasons.push('Some states restrict voting rights for individuals determined mentally incompetent by a court');
      nextSteps.push('Consult with legal counsel about your specific situation');
      nextSteps.push(`Check ${state || 'your state'}'s laws regarding mental competency and voting rights`);
    }

    // Add positive next steps for eligible voters
    if (eligible && registrationStatus === 'registered') {
      nextSteps = [
        'Verify your voter registration is current and accurate',
        'Find your polling location at vote.gov',
        'Check what ID you need to bring (requirements vary by state)',
        'Research candidates and ballot measures before Election Day',
        'Make a voting plan - decide when and how you will vote',
        'Consider early voting or absentee voting options'
      ];
    }

    // State-specific recommendations
    if (state) {
      recommendations.push(`Check ${state}-specific voting requirements and deadlines`);
    }

    const result = {
      eligible,
      reasons: reasons.length > 0 ? reasons : ['Based on the information provided, you appear eligible to vote'],
      recommendations: recommendations.length > 0 ? recommendations : ['Complete all required fields for a full eligibility assessment'],
      nextSteps: nextSteps.length > 0 ? nextSteps : [
        'Ensure you are registered to vote',
        'Know your polling location',
        'Bring required identification',
        'Research candidates and issues'
      ],
      resources: [
        {
          title: 'Vote.gov - Official Voting Information',
          url: 'https://vote.gov',
          type: 'website'
        },
        {
          title: 'Check Your Voter Registration',
          url: 'https://www.vote.gov/register/check-registration/',
          type: 'website'
        },
        {
          title: state ? `${state} Secretary of State` : 'State Election Information',
          url: state ? `https://www.vote.gov/state/${state.toLowerCase()}` : 'https://www.vote.gov',
          type: 'website'
        },
        {
          title: 'Voter Registration Deadlines by State',
          url: 'https://www.vote.gov/register/state/',
          type: 'website'
        }
      ]
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get list of all states
router.get('/states', async (req, res) => {
  try {
    const states = [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' },
      { code: 'DC', name: 'District of Columbia' }
    ];

    res.json({
      success: true,
      data: { states }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get state-specific voting information
router.get('/state/:stateCode', async (req, res) => {
  try {
    const { stateCode } = req.params;
    
    // State-specific information (simplified - would come from database in production)
    const stateData = {
      AL: { name: 'Alabama', registrationDeadline: '15 days before election', idRequired: true, earlyVoting: true },
      AK: { name: 'Alaska', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      AZ: { name: 'Arizona', registrationDeadline: '29 days before election', idRequired: true, earlyVoting: true },
      AR: { name: 'Arkansas', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      CA: { name: 'California', registrationDeadline: '15 days before election', idRequired: false, earlyVoting: true },
      CO: { name: 'Colorado', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      CT: { name: 'Connecticut', registrationDeadline: '7 days before election', idRequired: false, earlyVoting: true },
      DE: { name: 'Delaware', registrationDeadline: '24 days before election', idRequired: false, earlyVoting: true },
      FL: { name: 'Florida', registrationDeadline: '29 days before election', idRequired: true, earlyVoting: true },
      GA: { name: 'Georgia', registrationDeadline: '29 days before election', idRequired: true, earlyVoting: true },
      HI: { name: 'Hawaii', registrationDeadline: '30 days before election', idRequired: false, earlyVoting: true },
      ID: { name: 'Idaho', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      IL: { name: 'Illinois', registrationDeadline: '16 days before election', idRequired: false, earlyVoting: true },
      IN: { name: 'Indiana', registrationDeadline: '29 days before election', idRequired: true, earlyVoting: true },
      IA: { name: 'Iowa', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      KS: { name: 'Kansas', registrationDeadline: '21 days before election', idRequired: true, earlyVoting: true },
      KY: { name: 'Kentucky', registrationDeadline: '29 days before election', idRequired: true, earlyVoting: true },
      LA: { name: 'Louisiana', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      ME: { name: 'Maine', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      MD: { name: 'Maryland', registrationDeadline: '21 days before election', idRequired: false, earlyVoting: true },
      MA: { name: 'Massachusetts', registrationDeadline: '20 days before election', idRequired: false, earlyVoting: true },
      MI: { name: 'Michigan', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      MN: { name: 'Minnesota', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      MS: { name: 'Mississippi', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: false },
      MO: { name: 'Missouri', registrationDeadline: '27 days before election', idRequired: true, earlyVoting: true },
      MT: { name: 'Montana', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      NE: { name: 'Nebraska', registrationDeadline: '18 days before election', idRequired: true, earlyVoting: true },
      NV: { name: 'Nevada', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      NH: { name: 'New Hampshire', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      NJ: { name: 'New Jersey', registrationDeadline: '21 days before election', idRequired: false, earlyVoting: true },
      NM: { name: 'New Mexico', registrationDeadline: '28 days before election', idRequired: false, earlyVoting: true },
      NY: { name: 'New York', registrationDeadline: '25 days before election', idRequired: false, earlyVoting: true },
      NC: { name: 'North Carolina', registrationDeadline: '25 days before election', idRequired: true, earlyVoting: true },
      ND: { name: 'North Dakota', registrationDeadline: 'No registration required', idRequired: true, earlyVoting: true },
      OH: { name: 'Ohio', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      OK: { name: 'Oklahoma', registrationDeadline: '25 days before election', idRequired: true, earlyVoting: true },
      OR: { name: 'Oregon', registrationDeadline: '21 days before election', idRequired: false, earlyVoting: true },
      PA: { name: 'Pennsylvania', registrationDeadline: '15 days before election', idRequired: false, earlyVoting: true },
      RI: { name: 'Rhode Island', registrationDeadline: '30 days before election', idRequired: false, earlyVoting: true },
      SC: { name: 'South Carolina', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: false },
      SD: { name: 'South Dakota', registrationDeadline: '15 days before election', idRequired: true, earlyVoting: true },
      TN: { name: 'Tennessee', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      TX: { name: 'Texas', registrationDeadline: '30 days before election', idRequired: true, earlyVoting: true },
      UT: { name: 'Utah', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      VT: { name: 'Vermont', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      VA: { name: 'Virginia', registrationDeadline: '22 days before election', idRequired: true, earlyVoting: true },
      WA: { name: 'Washington', registrationDeadline: '8 days before election', idRequired: false, earlyVoting: true },
      WV: { name: 'West Virginia', registrationDeadline: '21 days before election', idRequired: true, earlyVoting: true },
      WI: { name: 'Wisconsin', registrationDeadline: 'Election Day (same-day registration)', idRequired: true, earlyVoting: true },
      WY: { name: 'Wyoming', registrationDeadline: 'Election Day (same-day registration)', idRequired: false, earlyVoting: true },
      DC: { name: 'District of Columbia', registrationDeadline: '30 days before election', idRequired: false, earlyVoting: true }
    };
    
    const stateInfo = stateData[stateCode.toUpperCase()] || {
      name: stateCode.toUpperCase(),
      registrationDeadline: '30 days before election',
      idRequired: true,
      earlyVoting: true
    };

    res.json({
      success: true,
      data: { stateInfo }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get voting requirements by state
router.get('/requirements/:stateCode', async (req, res) => {
  try {
    const { stateCode } = req.params;
    
    const requirements = {
      state: stateCode.toUpperCase(),
      minimumAge: 18,
      citizenshipRequired: true,
      registrationRequired: true,
      registrationDeadline: '30 days before election',
      idRequired: true,
      idTypes: [
        'Driver\'s license',
        'State ID card',
        'Passport',
        'Military ID'
      ],
      felonyRestrictions: 'Varies by state',
      mentalCompetencyRestrictions: 'Court-determined incompetency may affect rights'
    };

    res.json({ requirements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;