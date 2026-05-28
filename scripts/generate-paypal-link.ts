import readline from "node:readline";
import { URL } from "node:url";

// Terminal colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function logBanner() {
  console.log(`\n${MAGENTA}${BOLD}┌───────────────────────────────────────────────┐`);
  console.log(`│       🧪 DIGITAL ALCHEMY PAYMENT LINKS       │`);
  console.log(`│             PayPal API Generator             │`);
  console.log(`└───────────────────────────────────────────────┘${RESET}\n`);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Parse simple CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" || args[i] === "-n") {
      flags.name = args[++i];
    } else if (args[i] === "--price" || args[i] === "-p") {
      flags.price = args[++i];
    } else if (args[i] === "--return-url" || args[i] === "-r") {
      flags.returnUrl = args[++i];
    } else if (args[i] === "--live" || args[i] === "-l") {
      flags.live = true;
    } else if (args[i] === "--sandbox" || args[i] === "-s") {
      flags.sandbox = true;
    }
  }
  return flags;
}

interface PayTokenResponse {
  access_token: string;
  expires_in: number;
}

interface CreateLinkResponse {
  id: string;
  status: string;
  payment_link?: string;
  links?: Array<{ href: string; rel: string; method: string }>;
}

async function main() {
  logBanner();

  const flags = parseArgs();

  // Determine target PayPal environment
  let isLive = false;
  if (flags.live) {
    isLive = true;
  } else if (flags.sandbox) {
    isLive = false;
  } else {
    // Default to what's defined in env, otherwise sandbox
    isLive = process.env.PAYPAL_ENV === "live";
  }

  const envLabel = isLive ? "LIVE" : "SANDBOX";
  const envColor = isLive ? RED : GREEN;

  console.log(`${CYAN}Target PayPal Environment:${RESET} ${envColor}${BOLD}${envLabel}${RESET}`);

  // Fetch credentials from env
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(`\n${RED}${BOLD}❌ ERROR: Missing PayPal API Credentials in environment!${RESET}`);
    console.error(`Ensure you are running with the env file:`);
    console.error(`  ${YELLOW}npx tsx --env-file=.env.local scripts/generate-paypal-link.ts${RESET}`);
    console.error(`And check that PAYPAL_CLIENT_ID & PAYPAL_CLIENT_SECRET are filled in .env.local.\n`);
    process.exit(1);
  }

  // Get inputs (CLI flags or dynamic prompt wizard)
  let name = (flags.name as string) || "";
  let priceInput = (flags.price as string) || "";
  let returnUrl = (flags.returnUrl as string) || "";

  const isInteractive = !name && !priceInput;

  if (!name) {
    name = await prompt(`${CYAN}${BOLD}🛒 Enter product name:${RESET} `);
    if (!name) {
      console.error(`${RED}Product name is required!${RESET}`);
      process.exit(1);
    }
  }

  if (!priceInput) {
    priceInput = await prompt(`${CYAN}${BOLD}💰 Enter price in USD (e.g. 49.00):${RESET} $`);
    if (!priceInput) {
      console.error(`${RED}Price is required!${RESET}`);
      process.exit(1);
    }
  }

  const price = parseFloat(priceInput);
  if (isNaN(price) || price <= 0) {
    console.error(`${RED}Invalid price amount! Must be a positive number.${RESET}`);
    process.exit(1);
  }

  if (!returnUrl) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digitalalchemy.dev";
    const defaultUrl = `${siteUrl}/checkout/success?product=${encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`;
    
    if (isInteractive) {
      returnUrl = await prompt(`${CYAN}${BOLD}🔗 Return URL (Press Enter for default: ${defaultUrl}):${RESET} `);
    }
    
    if (!returnUrl) {
      returnUrl = defaultUrl;
    }
  }

  // Double check the return URL is a valid URL format
  try {
    new URL(returnUrl);
  } catch (err) {
    console.error(`${RED}Invalid return URL format!${RESET}`);
    process.exit(1);
  }

  const formattedPrice = price.toFixed(2);

  console.log(`\n${CYAN}─────────────────────────────────────────────────`);
  console.log(`${BOLD}Product Details:${RESET}`);
  console.log(`  Name:        ${BOLD}${name}${RESET}`);
  console.log(`  Price:       ${BOLD}$${formattedPrice} USD${RESET}`);
  console.log(`  Return URL:  ${YELLOW}${returnUrl}${RESET}`);
  console.log(`${CYAN}─────────────────────────────────────────────────${RESET}\n`);

  const apiBase = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  console.log(`⚡ Authenticating with PayPal (${envLabel})...`);

  // Step 1: Get OAuth2 Access Token
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  let accessToken = "";

  try {
    const tokenRes = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Auth failed (${tokenRes.status}): ${errText}`);
    }

    const tokenJson = (await tokenRes.json()) as PayTokenResponse;
    accessToken = tokenJson.access_token;
    console.log(`${GREEN}✓ Authenticated successfully!${RESET}`);
  } catch (error) {
    console.error(`\n${RED}${BOLD}❌ OAuth Token Error:${RESET}`, (error as Error).message);
    process.exit(1);
  }

  // Step 2: Generate PayPal Payment Link
  console.log(`⚡ Generating payment link via PayPal API...`);
  
  const payload = {
    type: "BUY_NOW",
    integration_mode: "LINK",
    reusable: "MULTIPLE",
    return_url: returnUrl,
    line_items: [
      {
        name: name,
        unit_amount: {
          currency_code: "USD",
          value: formattedPrice,
        },
      },
    ],
  };

  try {
    // Generate a unique request ID for PayPal API idempotency
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const linkRes = await fetch(`${apiBase}/v1/checkout/payment-resources`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
      body: JSON.stringify(payload),
    });

    if (!linkRes.ok) {
      const errText = await linkRes.text();
      throw new Error(`Link generation failed (${linkRes.status}): ${errText}`);
    }

    const linkJson = (await linkRes.json()) as CreateLinkResponse;
    
    // Extract the payment link
    const paymentLink =
      linkJson.payment_link ||
      linkJson.links?.find((l) => l.rel === "payment_link")?.href;

    if (!paymentLink) {
      throw new Error(`PayPal response did not contain a payment link! Response: ${JSON.stringify(linkJson)}`);
    }

    console.log(`\n${GREEN}${BOLD}🎉 SUCCESS! Your PayPal Payment Link is ready!${RESET}`);
    console.log(`${CYAN}─────────────────────────────────────────────────${RESET}`);
    console.log(`${BOLD}Payment Link (Copy & Paste this!):${RESET}`);
    console.log(`${GREEN}${BOLD}${paymentLink}${RESET}`);
    console.log(`${CYAN}─────────────────────────────────────────────────${RESET}`);
    console.log(`${YELLOW}You can drop this link directly into Tally, share it, or link buttons to it!${RESET}\n`);

  } catch (error) {
    console.error(`\n${RED}${BOLD}❌ Link Generation Error:${RESET}`, (error as Error).message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
