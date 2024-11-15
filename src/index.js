// Helper to detect Node.js environment
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export class OhImg {
  constructor(config) {
    if (!config?.publishableKey?.trim()) {
      throw new Error("Publishable key is required");
    }
    if (!config?.publishableSecret?.trim()) {
      throw new Error("Webhook secret is required");
    }

    this.publishableKey = config.publishableKey.trim();
    this.publishableSecret = config.publishableSecret.trim();
    this.baseUrl = config.baseUrl?.trim() || "https://og.ohimg.dev";

    // Initialize crypto for Node.js environment
    if (isNode) {
      import("node:crypto")
        .then((crypto) => {
          this.nodeCrypto = crypto;
        })
        .catch(() => {
          console.warn("Node.js crypto import failed");
        });
    }
  }

  async generateSignature(input) {
    this.validateInput(input);

    const timestamp = Math.floor(Date.now() / 1000);
    const fullUrl = `${input.pageUrl}`;

    const encodedOptions = this.encodeImageOptions(input.imageOptions || {});

    const payload = `${timestamp}.${this.publishableKey}.${fullUrl}${encodedOptions}`;
    const signature = await this.hmac(payload);

    return {
      signature,
      timestamp,
      fullUrl,
      encodedOptions,
    };
  }

  encodeImageOptions(imageOptions) {
    if (!imageOptions) return undefined;

    try {
      // Convert to JSON string and then base64 encode
      const jsonStr = JSON.stringify(imageOptions);

      // Handle different environments for base64 encoding
      if (isNode) {
        return Buffer.from(jsonStr).toString("base64");
      } else {
        return btoa(jsonStr);
      }
    } catch (error) {
      console.warn("Failed to encode imageOptions:", error);
      return undefined;
    }
  }

  async getOgImageUrl(input) {
    this.validateInput(input);

    const { signature, timestamp, fullUrl, encodedOptions } =
      await this.generateSignature(input);

    const params = new URLSearchParams({
      url: fullUrl,
      t: timestamp.toString(),
      sign: signature,
      key: this.publishableKey,
    });

    if (encodedOptions) {
      params.append("opts", encodedOptions);
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  validateInput(input) {
    if (!input) {
      throw new Error("Input is required");
    }

    if (!input.pageUrl?.trim()) {
      throw new Error("pageUrl is required");
    }

    if (!input.pageUrl.match(/^https?:\/\//)) {
      throw new Error("pageUrl must include protocol (http:// or https://)");
    }
  }

  async hmac(message) {
    if (!this.publishableSecret) {
      throw new Error("Webhook secret is required");
    }

    // Node.js environment
    if (isNode) {
      // Wait for crypto to be initialized if needed
      if (!this.nodeCrypto) {
        this.nodeCrypto = await import("node:crypto");
      }

      const hmac = this.nodeCrypto.createHmac("sha256", this.publishableSecret);
      hmac.update(message);
      return hmac.digest("base64url");
    }

    // Web Crypto API for browsers/Deno/Cloudflare Workers
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.publishableSecret);
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

    throw new Error("No crypto implementation available");
  }

  bufferToBase64Url(buffer) {
    // Node.js Buffer
    if (typeof Buffer !== "undefined") {
      return Buffer.from(buffer).toString("base64url");
    }

    // Browser/Deno/Cloudflare
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

export const getOGImageUrl = async (config, input) => {
  const ohimg = new OhImg(config);
  return ohimg.getOgImageUrl(input);
};
