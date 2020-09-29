require("dotenv").config();
const crypto = require("crypto");

const algorithm = process.env["ENCRYPTION_ALGORITHM"];
const key = Buffer.from(`${process.env["ENCRYPTION_KEY"]}`, "base64");

module.exports = {
	encrypt: (text) => {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ":" + encrypted.toString("hex");
	},
	decrypt: (text) => {
		const textParts = text.split(":");
		const iv = Buffer.from(textParts.shift(), "hex");
		const encryptedText = Buffer.from(textParts.join(":"), "hex");
		const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, "hex"), iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	},
	md5sum: (text) => {
		const md5sum = crypto.createHash("md5").update(text);
		return md5sum.digest("hex");
	},
};
