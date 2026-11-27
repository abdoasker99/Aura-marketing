// Click redirect: /t/c/<token>?u=<real link>&s=<signature>
// Sends the person straight to the real link (always works), then writes "Link clicked at" + which link into the
// sheet. Links without a valid signature only ever go to the website (no open redirect).
const T = require("./_track");

module.exports = async (req, res) => {
  const token = String(req.query.t || "");
  const url = String(req.query.u || "");
  const valid = /^https?:\/\//i.test(url) && T.sameSig(req.query.s, T.sign(token, url));
  const lead = T.leadOf(token);
  if (valid && lead && !T.isBot(req)) {
    const now = T.kuwaitNow();
    const job = T.toSheet(lead, { "Link clicked at": now, "Last link clicked": T.linkLabel(url), "Email opened at": now },
      T.sheetOf(token));
    if (req.query.wait === "1" || !T.later(job)) res.setHeader("X-Track-Result", await job);
  }
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 302;
  res.setHeader("Location", valid ? url : T.HOME);
  res.end();
};
