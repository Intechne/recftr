export const PUBLIC_CONTACT = {
  support: "destek@recfturkiye.com",
  events: "etkinlik@recfturkiye.com",
} as const;

// Migrate only former RECF contact aliases when rendering older CMS content.
// Supplied legal documents and third-party addresses are not changed.
export function currentContactEmails(text: string): string {
  return text.replace(/[a-z0-9._%+-]+@recfturkiye\.(?:org|com)(?![a-z0-9-]|\.[a-z0-9])/gi, address => {
    const name = address.split("@")[0].toLowerCase();
    if (["takim", "teams", "events", "etkinlik"].includes(name)) return PUBLIC_CONTACT.events;
    if (["info", "mentor", "kvkk", "gizlilik", "destek"].includes(name)) return PUBLIC_CONTACT.support;
    return address;
  });
}

export function currentContactSettings(settings: Record<string, string>) {
  return {
    ...settings,
    contact_info: currentContactEmails(settings.contact_info || PUBLIC_CONTACT.support),
    contact_team: currentContactEmails(settings.contact_team || PUBLIC_CONTACT.events),
  };
}
