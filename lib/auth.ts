import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload, type SessionRole } from "@/lib/session";
import { findUserByEmail, isSessionRevoked } from "@/lib/db";
import { createHash } from "crypto";
import { bootstrapSessionVersion } from "@/lib/security";

export const CMS_ROLES: SessionRole[] = ["admin", "editor", "approvals", "technical"];

export async function sessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const token = await verifySessionToken(raw);
  if (!token) return null;
  if (await isSessionRevoked(createHash("sha256").update(raw!).digest("hex"))) return null;

  // Bootstrap administrator is controlled by Vercel environment variables, not cms_users.
  const bootstrapEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (token.role === "admin" && bootstrapEmail && token.email.toLowerCase() === bootstrapEmail && token.sv === bootstrapSessionVersion(String(process.env.ADMIN_PASSWORD || ""))) return token;

  const user = await findUserByEmail(token.email);
  if (!user?.active) return null;
  if (String(user.role) !== token.role) return null;
  if (Number(user.session_version || 1) !== token.sv) return null;
  const currentTeam = user.team_num ? String(user.team_num) : null;
  if (token.role === "mentor" && (!currentTeam || currentTeam !== (token.teamNum || null))) return null;
  if (token.role !== "mentor" && token.teamNum) return null;

  return {
    ...token,
    name: String(user.name || token.name || ""),
    teamNum: currentTeam,
    mustChangePassword: !!user.must_change_password,
  };
}

export async function hasRole(req: NextRequest, roles: SessionRole[]) {
  const session = await sessionFromRequest(req);
  return session && !session.mustChangePassword && roles.includes(session.role) ? session : null;
}
export async function cmsSession(req: NextRequest) { return hasRole(req, CMS_ROLES); }
export async function adminSession(req: NextRequest) { return hasRole(req, ["admin"]); }
export async function contentSession(req: NextRequest) { return hasRole(req, ["admin","editor"]); }
export async function approvalsSession(req: NextRequest) { return hasRole(req, ["admin","approvals"]); }
export async function docsSession(req: NextRequest) { return hasRole(req, ["admin","approvals","technical"]); }
export async function contactSession(req: NextRequest) { return hasRole(req, ["admin","editor","approvals"]); }
export async function portalSession(req: NextRequest) { return hasRole(req, ["mentor"]); }
