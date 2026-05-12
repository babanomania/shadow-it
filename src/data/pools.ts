// Name / vendor / dept vocabulary for the procedural day generator.
// Hand-authored anchor days don't touch any of this.

export const FIRST_NAMES = [
  'alex', 'sam', 'jordan', 'casey', 'morgan', 'taylor', 'jamie', 'riley',
  'avery', 'quinn', 'reese', 'sasha', 'devon', 'kai', 'noor', 'aanya',
  'rohan', 'mei', 'liang', 'yuki', 'soren', 'inga', 'oliver', 'matias',
  'sofia', 'elena', 'lucia', 'pablo', 'nadia', 'ravi', 'kenji', 'ana',
  'jin', 'whitney', 'theo', 'beth', 'simon', 'ines', 'omar', 'leah',
  'noah', 'eli', 'maya', 'farah', 'iris', 'colin', 'rosa', 'wendell',
];

export const LAST_NAMES = [
  'chen', 'patel', 'okafor', 'novak', 'ramos', 'kim', 'fischer', 'sato',
  'singh', 'lopez', 'haddad', 'morales', 'nguyen', 'oduya', 'kowalski',
  'ahmed', 'silva', 'becker', 'park', 'okonkwo', 'tran', 'mathur', 'roy',
  'ito', 'gupta', 'liu', 'wong', 'caron', 'das', 'kapoor', 'larsen',
  'almeida', 'hernandez', 'oconnor', 'mitchell', 'tanaka', 'ibrahim',
];

export const DEPTS = [
  'marketing', 'engineering', 'sales', 'finance', 'hr',
  'design', 'product', 'ops', 'legal', 'customer-success',
];

export const SEED_DEPTS = ['marketing', 'engineering', 'sales', 'finance', 'hr'];

export const VENDORS_AI = [
  'claude-pro-team', 'chatgpt-team', 'midjourney-pro', 'github-copilot',
  'perplexity-pro', 'cursor-pro', 'replit-teams', 'notion-ai', 'jasper-ai',
  'runway-ml', 'eleven-labs', 'descript-pro', 'gamma-app', 'glean-team',
];

export const VENDORS_SAAS = [
  'figma-enterprise', 'linear-business', 'datadog-enterprise', 'sentry-business',
  'pagerduty-enterprise', 'hubspot-marketing', 'salesforce-enterprise',
  'workday-renew', 'okta-enterprise', 'gong-call', 'segment-team',
  'mixpanel-growth', 'amplitude-growth', 'looker-standard', 'asana-business',
  'monday-pro', 'airtable-pro', 'webflow-team',
];

export const VENDORS_CLOUD = [
  'aws-marketplace-snowflake', 'aws-marketplace-databricks', 'gcp-bigquery',
  'azure-cosmos', 'cloudflare-enterprise', 'fastly-cdn', 'vercel-enterprise',
  'render-pro', 'netlify-enterprise', 'planetscale-scaler', 'supabase-team',
];

export const EXTERNAL_DOMAINS_BENIGN = [
  'segment.io/api', 'salesforce.com/sync', 'hubspot.com/api',
  'datadog.com/intake', 'sentry.io/api', 'docs.helix.corp/build',
  'hooks.stripe.com', 'cdn.helix.corp', 'mixpanel.com/track',
  'api.github.com', 'workday.com/sync',
];

export const EXTERNAL_DOMAINS_PARTNER = [
  'partner-bridge.example', 'data-pipe.example', 'integrations.example',
  'webhook.partner.example',
];

export const PARTNER_NAMES = [
  'atlas-bridge', 'meridian-data', 'oakline-ops', 'crestone-llc',
  'silverline-co', 'westbrook-partners', 'parkway-systems',
];

// Pseudo-PR / friendly subjects so the inbox still feels alive on filler days.
export const NOISE_EMAIL_SUBJECTS = [
  'Weekly digest — postmortems, RFCs, ships',
  'Town hall — Friday 4 PM',
  'Open enrollment runs through Oct 31',
  'Patch tuesday — 3 advisories this cycle',
  'Q4 budget cycle — submit by 11/15',
  'Quarterly access review starts Monday',
  'Standup recap — Tuesday',
  'Reminder — performance cycle close 11/20',
  'Catered lunch Wednesday',
  'New laptop replacement window open',
  'Office wifi maintenance — 2am Saturday',
  'Vendor renewal — standard tier, no changes',
];

export const NOISE_LOG_TEMPLATES: Array<(name: string, vendor: string) => {
  service: string;
  event: string;
  user: string;
  detail: string;
}> = [
  (n) => ({ service: 'auth', event: 'login', user: `${n}@helix.corp`, detail: `src=10.0.${(n.charCodeAt(0) % 9) + 1}.${(n.charCodeAt(1) % 99) + 1} mfa=ok` }),
  (_n, v) => ({ service: 'expense', event: 'charge', user: 'finance-bot', detail: `vendor="${v}" amount=$${1200 + Math.floor((v.charCodeAt(0) * 13) % 8000)}.00 dept=ops` }),
  (_n) => ({ service: 'traffic', event: 'egress', user: 'analytics-job', detail: `dest=segment.io/api bytes=${20 + (_n.charCodeAt(0) % 60)}MB proto=https` }),
  (_n) => ({ service: 'traffic', event: 'egress', user: 'crm-sync', detail: `dest=salesforce.com/sync bytes=${10 + (_n.charCodeAt(0) % 40)}MB proto=https` }),
  (n) => ({ service: 'api', event: 'read', user: 'support-portal', detail: `table=tickets rows=${100 + (n.charCodeAt(0) * 7) % 800} caller=support-bot` }),
  (n) => ({ service: 'auth', event: 'logout', user: `${n}@helix.corp`, detail: '' }),
  (_n) => ({ service: 'traffic', event: 'ingress', user: 'webhook-srv', detail: `src=hooks.stripe.com bytes=${1 + _n.charCodeAt(0) % 4}.${_n.charCodeAt(1) % 9}MB proto=https` }),
  (_n) => ({ service: 'pagerduty', event: 'oncall.handoff', user: 'sre-bot', detail: 'team=core rotation=weekly' }),
  (_n) => ({ service: 'iam', event: 'role.expire', user: 'sysadmin@helix.corp', detail: 'reason=ttl scope=staging-readonly' }),
];
