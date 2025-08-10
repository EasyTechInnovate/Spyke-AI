// Product Generator for Client-side use
// Generates random, valid product JSON for the Spyke-AI marketplace

const PRODUCT_TYPES = ['prompt', 'automation', 'agent', 'bundle'];
const PRODUCT_CATEGORIES = [
  'lead_generation', 'sales', 'marketing', 'customer_support', 
  'analytics', 'content_creation', 'social_media', 'ecommerce',
  'productivity', 'development', 'design', 'education',
  'finance', 'healthcare', 'hr', 'other'
];
const PRODUCT_INDUSTRIES = [
  'saas', 'ecommerce', 'healthcare', 'finance', 'education',
  'real_estate', 'marketing_agency', 'consulting', 'manufacturing',
  'retail', 'hospitality', 'technology', 'nonprofit', 'other'
];
const SETUP_TIMES = [
  'instant', 'under_30_mins', 'under_1_hour', 
  'under_3_hours', 'under_1_day', 'custom'
];
const DELIVERY_METHODS = ['link', 'download', 'api', 'custom'];
const FREQUENCY_OF_USE = ['one_time', 'recurring', 'ongoing'];

const TOOL_NAMES = [
  'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'GitHub Copilot',
  'Zapier', 'Make', 'n8n', 'Webhooks', 'Custom API',
  'Google Sheets', 'Airtable', 'Notion', 'Slack', 'Discord',
  'Mailchimp', 'SendGrid', 'Twilio', 'Stripe', 'PayPal'
];

const PRODUCT_TITLES = [
  'AI-Powered {industry} {type} System',
  'Automated {category} Solution for {industry}',
  'Smart {category} {type} Template',
  'Professional {industry} {category} Toolkit',
  'Advanced {type} for {category}',
  '{industry} {category} Automation Suite',
  'Next-Gen {type} for {industry} Teams',
  'Ultimate {category} {type} Package'
];

const BENEFITS = [
  'Save {hours} hours per week',
  'Increase productivity by {percent}%',
  'Reduce manual work by {percent}%',
  'Generate {number}x more leads',
  'Improve conversion rates by {percent}%',
  'Automate {percent}% of repetitive tasks',
  'Scale operations without adding headcount',
  '24/7 automated {task} handling',
  'Eliminate human error in {process}',
  'Real-time {metric} tracking and optimization'
];

const USE_CASES = [
  'Qualifying leads from multiple sources',
  'Automated customer onboarding',
  'Content generation and scheduling',
  'Data analysis and reporting',
  'Customer support automation',
  'Sales pipeline management',
  'Marketing campaign optimization',
  'Inventory management',
  'Financial forecasting',
  'Team collaboration enhancement'
];

const HOW_IT_WORKS = [
  'Connect your existing tools and platforms',
  'Configure automation rules and triggers',
  'AI analyzes and processes data in real-time',
  'Automated actions execute based on conditions',
  'Monitor results through intuitive dashboard',
  'Continuous optimization using machine learning',
  'Scale up or down based on your needs'
];

const OUTCOMES = [
  '{percent}% increase in efficiency',
  '{percent}% reduction in operational costs',
  '{number}x ROI within {months} months',
  '{hours} hours saved per week',
  '{percent}% improvement in customer satisfaction',
  '{percent}% faster response times',
  '{number}x increase in output quality'
];

const FAQ_QUESTIONS = [
  'How long does setup take?',
  'Do I need coding skills?',
  'What support is included?',
  'Can I customize the solution?',
  'Is there a trial period?',
  'How does pricing work?',
  'What integrations are supported?',
  'How secure is the data?',
  'Can I export my data?',
  'What happens if I cancel?'
];

const FAQ_ANSWERS = [
  'Setup typically takes {time} with our step-by-step guide',
  'No coding required! Everything is {method}',
  'We provide {support} support for all customers',
  'Yes, you can customize {customizable} to fit your needs',
  'We offer a {trial} trial with full features',
  'Pricing is {pricing} with no hidden fees',
  'We support {integrations} and more',
  'Your data is {security} with enterprise-grade security',
  'Yes, you can export all your data in {formats} formats',
  'You keep {retention} after cancellation'
];

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomArray(sourceArray, minItems, maxItems) {
  const count = randomNumber(minItems, maxItems);
  const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function replacePlaceholders(template) {
  return template
    .replace(/{industry}/g, randomElement(PRODUCT_INDUSTRIES))
    .replace(/{category}/g, randomElement(PRODUCT_CATEGORIES))
    .replace(/{type}/g, randomElement(PRODUCT_TYPES))
    .replace(/{hours}/g, randomNumber(5, 40))
    .replace(/{percent}/g, randomNumber(20, 80))
    .replace(/{number}/g, randomNumber(2, 10))
    .replace(/{months}/g, randomNumber(1, 6))
    .replace(/{time}/g, randomElement(['30 minutes', '1 hour', '2 hours', 'half a day']))
    .replace(/{method}/g, randomElement(['no-code', 'drag-and-drop', 'visual']))
    .replace(/{support}/g, randomElement(['24/7 email', 'priority', 'dedicated']))
    .replace(/{customizable}/g, randomElement(['workflows', 'templates', 'integrations']))
    .replace(/{trial}/g, randomElement(['7-day', '14-day', '30-day']))
    .replace(/{pricing}/g, randomElement(['transparent', 'usage-based', 'flat-rate']))
    .replace(/{integrations}/g, randomElement(['100+', '50+', 'all major']))
    .replace(/{security}/g, randomElement(['encrypted', 'protected', 'secured']))
    .replace(/{formats}/g, randomElement(['CSV, JSON, and Excel', 'multiple', 'standard']))
    .replace(/{retention}/g, randomElement(['access for 30 days', 'your data', 'everything']))
    .replace(/{task}/g, randomElement(['customer inquiry', 'lead qualification', 'order processing']))
    .replace(/{process}/g, randomElement(['data entry', 'calculations', 'reporting']))
    .replace(/{metric}/g, randomElement(['performance', 'conversion', 'engagement']));
}

function generateTools() {
  const toolCount = randomNumber(1, 5);
  const selectedTools = generateRandomArray(TOOL_NAMES, toolCount, toolCount);
  
  return selectedTools.map(name => {
    const tool = { name };
    
    // Add logo URL (use Unsplash small image instead of placeholder provider)
    tool.logo = 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=40&h=40&q=60';
    
    // Sometimes add model (for AI tools)
    if (name.includes('GPT') || name.includes('Claude') || name.includes('Gemini')) {
      tool.model = randomElement(['GPT-4', 'GPT-3.5', 'Claude-3', 'Gemini-Pro']);
    }
    
    // Sometimes add link
    if (Math.random() > 0.5) {
      tool.link = `https://example.com/tool/${name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    return tool;
  });
}

function generateFAQs() {
  const faqCount = randomNumber(2, 5);
  const selectedQuestions = generateRandomArray(FAQ_QUESTIONS, faqCount, faqCount);
  
  return selectedQuestions.map((question, index) => ({
    question: question,
    answer: replacePlaceholders(FAQ_ANSWERS[index] || FAQ_ANSWERS[0])
  }));
}

function generateTags() {
  const tags = [
    'automation', 'ai', 'no-code', 'productivity', 'integration',
    'analytics', 'workflow', 'optimization', 'scalable', 'enterprise',
    'startup', 'small-business', 'agency', 'saas', 'b2b', 'b2c'
  ];
  return generateRandomArray(tags, 3, 8);
}

function generateSearchKeywords() {
  const keywords = [
    'automation tool', 'ai solution', 'productivity software',
    'business automation', 'workflow optimization', 'lead generation',
    'sales automation', 'marketing tool', 'customer support',
    'data analytics', 'integration platform', 'no-code solution'
  ];
  return generateRandomArray(keywords, 3, 6);
}

export function generateProduct() {
  const type = randomElement(PRODUCT_TYPES);
  const category = randomElement(PRODUCT_CATEGORIES);
  const industry = randomElement(PRODUCT_INDUSTRIES);
  
  const title = replacePlaceholders(randomElement(PRODUCT_TITLES));
  const price = randomNumber(9, 999);
  const originalPrice = Math.random() > 0.5 ? price + randomNumber(50, 200) : undefined;
  
  const product = {
    title: title,
    type: type,
    category: category,
    industry: industry,
    shortDescription: replacePlaceholders(`${randomElement(['Revolutionary', 'Advanced', 'Professional', 'Cutting-edge'])} ${type} solution that helps ${industry} businesses optimize their ${category} processes with AI-powered automation.`),
    fullDescription: replacePlaceholders(`This comprehensive ${type} solution is specifically designed for ${industry} companies looking to transform their ${category} operations. Using advanced AI technology and seamless integrations, our system automates complex workflows, reduces manual effort by up to {percent}%, and delivers measurable results within weeks. Perfect for teams of all sizes who want to scale their operations without proportionally increasing costs.`),
    targetAudience: replacePlaceholders(`${industry} companies, ${randomElement(['startups', 'SMBs', 'enterprises'])}, ${category} teams, ${randomElement(['growth-focused', 'innovation-driven', 'efficiency-minded'])} organizations`),
    benefits: generateRandomArray(BENEFITS, 3, 5).map(b => replacePlaceholders(b)),
    useCaseExamples: generateRandomArray(USE_CASES, 3, 5),
    howItWorks: generateRandomArray(HOW_IT_WORKS, 4, 6),
    outcome: generateRandomArray(OUTCOMES, 2, 4).map(o => replacePlaceholders(o)),
    toolsUsed: generateTools(),
    setupTime: randomElement(SETUP_TIMES),
    deliveryMethod: randomElement(DELIVERY_METHODS),
    embedLink: `https://example.com/template/${title.toLowerCase().replace(/\s+/g, '-')}`,
    price: price,
    originalPrice: originalPrice,
    thumbnail: `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${Array(12).fill(0).map(() => randomElement('0123456789abcdef')).join('')}?w=1200&h=800&fit=crop`,
    images: [
      `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${Array(12).fill(0).map(() => randomElement('0123456789abcdef')).join('')}?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${Array(12).fill(0).map(() => randomElement('0123456789abcdef')).join('')}?w=800&h=600&fit=crop`
    ],
    previewVideo: Math.random() > 0.5 ? `https://www.youtube.com/watch?v=${Array(11).fill(0).map(() => randomElement('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_')).join('')}` : undefined,
    tags: generateTags(),
    searchKeywords: generateSearchKeywords(),
    estimatedHoursSaved: `${randomNumber(5, 40)}+ hours/week`,
    metricsImpacted: replacePlaceholders(`${randomElement(['Conversion rate', 'Lead quality', 'Response time', 'Customer satisfaction', 'Operational efficiency'])}, ${randomElement(['Revenue growth', 'Cost reduction', 'Team productivity', 'Data accuracy'])}}`),
    frequencyOfUse: randomElement(FREQUENCY_OF_USE),
    hasAffiliateTools: Math.random() > 0.7,
    expectedSupport: randomElement([
      'Email support within 24 hours',
      'Priority email support',
      'Dedicated support channel',
      'Community forum access'
    ]),
    faqs: generateFAQs()
  };
  
  // Add optional fields sometimes
  if (Math.random() > 0.5) {
    product.hasRefundPolicy = true;
    product.hasGuarantee = true;
    product.guaranteeText = randomElement([
      '30-day money-back guarantee',
      '100% satisfaction guarantee',
      'Results guaranteed or your money back'
    ]);
  }
  
  return product;
}