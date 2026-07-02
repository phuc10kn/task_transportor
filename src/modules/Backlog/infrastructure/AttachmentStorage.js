const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function safeSegment(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function createAttachmentStorage({ config }) {
  return {
    save({ projectId, issueId, attachmentId, filename, body }) {
      const relativeDir = path.join(
        String(projectId),
        safeSegment(issueId),
        safeSegment(attachmentId)
      );
      const relativePath = path.join(relativeDir, safeSegment(filename));
      const absoluteDir = path.join(config.storage.attachments, relativeDir);
      const absolutePath = path.join(config.storage.attachments, relativePath);

      fs.mkdirSync(absoluteDir, { recursive: true });
      fs.writeFileSync(absolutePath, body);

      return {
        stored_path: relativePath.replace(/\\/g, "/"),
        sha256: crypto.createHash("sha256").update(body).digest("hex"),
        size_bytes: body.length,
      };
    },
  };
}

module.exports = {
  createAttachmentStorage,
};
