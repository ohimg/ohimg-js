// src/index.ts

// Import Node.js crypto for Node environment
import * as nodeCrypto from "crypto";

interface OhImgConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl?: string;
}

interface SignatureInput {
  path: string;
  domain: string;
}

export class OhImg {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl: string;

  constructor(config: OhImgConfig) {
    if (!config?.apiKey?.trim()) {
      throw new Error("API key is required");
    }
    if (!config?.webhookSecret?.trim()) {
      throw new Error("Webhook secret is required");
    }

    this.apiKey = config.apiKey.trim();
    this.webhookSecret = config.webhookSecret.trim();
    this.baseUrl = config.baseUrl?.trim() || "https://og.ohimg.dev";
  }

  async generateSignature(input: SignatureInput) {
    this.validateInput(input);

    const timestamp = Math.floor(Date.now() / 1000);
    const fullUrl = `${input.domain}${input.path}`;

    const payload = `${timestamp}.${this.apiKey}.${fullUrl}`;
    const signature = await this.hmac(payload);

    return {
      signature,
      timestamp,
      fullUrl,
    };
  }

  async getImageUrl(input: SignatureInput): Promise<string> {
    this.validateInput(input);

    const { signature, timestamp, fullUrl } = await this.generateSignature(
      input
    );

    const params = new URLSearchParams({
      url: fullUrl,
      t: timestamp.toString(),
      sign: signature,
      key: this.apiKey,
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  private validateInput(input: SignatureInput): void {
    if (!input) {
      throw new Error("Input is required");
    }

    if (!input.path?.trim()) {
      throw new Error("Path is required");
    }

    if (!input.domain?.trim()) {
      throw new Error("Domain is required");
    }

    if (!input.domain.match(/^https?:\/\//)) {
      throw new Error("Domain must include protocol (http:// or https://)");
    }
  }

  private async hmac(message: string): Promise<string> {
    if (!this.webhookSecret) {
      throw new Error("Webhook secret is required");
    }

    // Node.js environment
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      const hmac = nodeCrypto.createHmac("sha256", this.webhookSecret);
      hmac.update(message);
      return hmac.digest("base64url");
    }

    // Browser/Deno environment
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.webhookSecret);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    return this.bufferToBase64Url(signature);
  }

  private bufferToBase64Url(buffer: ArrayBuffer): string {
    // Node.js Buffer
    if (typeof Buffer !== "undefined") {
      return Buffer.from(buffer).toString("base64url");
    }

    // Browser/Deno
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

export async function getOGImageUrl(
  config: OhImgConfig,
  input: SignatureInput
): Promise<string> {
  const ohimg = new OhImg(config);
  return ohimg.getImageUrl(input);
}
