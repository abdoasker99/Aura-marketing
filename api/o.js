// Open pixel: /t/o/<token>.gif  →  writes "Email opened at" into the person's sheet row.
const T = require("./_track");

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

module.exports = async (req, res) => {
  const token = String(req.query.f || "").replace(/\.gif$/i, "");
  const lead = T.leadOf(token);
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  if (lead && !T.isBot(req)) {
    const job = T.toSheet(lead, { "Email opened at": T.kuwaitNow() }, T.sheetOf(token));
    if (req.query.wait === "1" || !T.later(job)) res.setHeader("X-Track-Result", await job);
  }
  res.statusCode = 200;
  res.end(GIF);
};
