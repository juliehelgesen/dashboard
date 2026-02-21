const crypto = require("crypto");
const fs = require("fs");

const PASSWORD = "Apex$54Kestrel&2026";
const ITER = 200000;

// Read decrypted content
const plain = fs.readFileSync("/home/user/dashboard/decrypted_dashboard.html");

// Generate fresh salt and IV
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

// Derive key
const key = crypto.pbkdf2Sync(PASSWORD, salt, ITER, 32, "sha256");

// Encrypt
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
const tag = cipher.getAuthTag();

// Combine ct + tag (16 bytes at end)
const ctWithTag = Buffer.concat([ct, tag]);

// Build payload
const payload = JSON.stringify({
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ct: ctWithTag.toString("base64"),
  iter: ITER,
});

// Read index.html and replace payload
let indexHtml = fs.readFileSync("/home/user/dashboard/index.html", "utf8");
const payloadRe = /\{"salt":"[^"]+","iv":"[^"]+","ct":"[^"]+"[^}]*\}/;

if (!payloadRe.test(indexHtml)) {
  console.error("Could not find payload pattern in index.html");
  process.exit(1);
}

indexHtml = indexHtml.replace(payloadRe, payload);
fs.writeFileSync("/home/user/dashboard/index.html", indexHtml);
console.log("Encrypted and written to index.html");
console.log("Payload size:", payload.length, "chars");
