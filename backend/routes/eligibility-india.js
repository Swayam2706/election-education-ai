const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Indian states and UTs
const indianStates = [
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CT', name: 'Chhattisgarh' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu and Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OR', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TG', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UT', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' }
];

// Eligibility check for Indian voters
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

    const { age, citizenship, state, registrationStatus } = req.body;

    let eligible = true;
    let reasons = [];
    let recommendations = [];
    let nextSteps = [];

    // Age check
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum < 18) {
        eligible = false;
        reasons.push('You must be at least 18 years old to vote in India');
        if (ageNum >= 17) {
          recommendations.push('Good news! You can register now if you will turn 18 by January 1st of next year');
          recommendations.push('The qualifying date for voter registration is January 1st');
        } else {
          nextSteps.push('You can register to vote when you turn 18 or will turn 18 by January 1st');
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
        reasons.push('You must be a citizen of India to vote');
        recommendations.push('Only Indian citizens can vote in Indian elections');
        nextSteps.push('If you are eligible, consider applying for Indian citizenship');
      }
    }

    // Registration check
    if (registrationStatus) {
      if (registrationStatus === 'registered') {
        recommendations.push('✓ You are registered to vote');
        nextSteps.push('Verify your registration at nvsp.in');
        nextSteps.push('Check your polling booth location');
      } else if (registrationStatus === 'not-registered') {
        if (eligible && age >= 18 && citizenship === 'citizen') {
          reasons.push('You must register to vote before you can cast your ballot');
          nextSteps.push('Register online at nvsp.in (National Voters Service Portal)');
          nextSteps.push('Fill Form 6 for new voter registration');
          nextSteps.push('Keep Aadhaar card and address proof ready');
          nextSteps.push('You can also download the Voter Helpline App');
        }
      } else if (registrationStatus === 'unsure') {
        nextSteps.push('Check your voter registration status at nvsp.in');
        nextSteps.push('Search using your name, father\'s name, and address');
        nextSteps.push('If not registered, register immediately');
      }
    }

    // Add positive next steps for eligible voters
    if (eligible && registrationStatus === 'registered') {
      nextSteps = [
        'Verify your details in the electoral roll at nvsp.in',
        'Ensure your Voter ID card (EPIC) is up to date',
        'Find your polling booth location',
        'Check polling booth timings (usually 7 AM to 6 PM)',
        'Carry your Voter ID or any other photo ID proof',
        'Research candidates and their manifestos'
      ];
    }

    // State-specific recommendations
    if (state) {
      const stateInfo = indianStates.find(s => s.code === state);
      if (stateInfo) {
        recommendations.push(`Check ${stateInfo.name}-specific election information`);
      }
    }

    const result = {
      eligible,
      reasons: reasons.length > 0 ? reasons : ['Based on the information provided, you appear eligible to vote in India'],
      recommendations: recommendations.length > 0 ? recommendations : ['Complete all required fields for a full eligibility assessment'],
      nextSteps: nextSteps.length > 0 ? nextSteps : [
        'Ensure you are registered to vote',
        'Know your polling booth location',
        'Carry valid photo ID',
        'Research candidates and issues'
      ],
      resources: [
        {
          title: 'National Voters Service Portal (NVSP)',
          url: 'https://www.nvsp.in',
          type: 'website'
        },
        {
          title: 'Election Commission of India',
          url: 'https://eci.gov.in',
          type: 'website'
        },
        {
          title: 'Voter Helpline App',
          url: 'https://play.google.com/store/apps/details?id=com.eci.citizen',
          type: 'app'
        },
        {
          title: 'Check Voter Registration Status',
          url: 'https://electoralsearch.in',
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

// Get list of all Indian states and UTs
router.get('/states', async (req, res) => {
  try {
    res.json({
      success: true,
      data: { states: indianStates }
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
    
    const stateInfo = indianStates.find(s => s.code === stateCode.toUpperCase());
    
    if (!stateInfo) {
      return res.status(404).json({
        success: false,
        error: { message: 'State not found' }
      });
    }

    const info = {
      name: stateInfo.name,
      registrationDeadline: 'Continuous registration available at nvsp.in',
      idRequired: true,
      earlyVoting: false,
      acceptedIds: [
        'Voter ID Card (EPIC)',
        'Aadhaar Card',
        'Passport',
        'Driving License',
        'PAN Card',
        'Service Identity Card',
        'Bank Passbook with Photo',
        'Health Insurance Smart Card',
        'MGNREGA Job Card',
        'Pension Document with Photo'
      ]
    };

    res.json({
      success: true,
      data: { stateInfo: info }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

module.exports = router;
