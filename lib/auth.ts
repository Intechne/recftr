import { NextRequest } from "next/server";
import { verifySessionToken, type SessionPayload, type SessionRole } from "@/lib/session";

export const CMS_ROLES: SessionRole[] = ["admin", "editor", "approvals", "technical"];
export async function sessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  return verifySessionToken(req.cookies.get("recf_session")?.value);
}
export async function hasRole(req: NextRequest, roles: SessionRole[]) {
  const session = await sessionFromRequest(req);
  return session && roles.includes(session.role) ? session : null;
}
export async function cmsSession(req: NextRequest) { return hasRole(req, CMS_ROLES); }
export async function adminSession(req: NextRequest) { return hasRole(req, ["admin"]); }
export async function contentSession(req: NextRequest) { return hasRole(req, ["admin","editor"]); }
export async function approvalsSession(req: NextRequest) { return hasRole(req, ["admin","approvals"]); }
export async function docsSession(req: NextRequest) { return hasRole(req, ["admin","approvals","technical"]); }
export async function portalSession(req: NextRequest) { return hasRole(req, ["mentor"]); }
