// Shared types for the booking flow client components.
// Keeps them free of server imports so they can be dropped into any page.

export interface Slot {
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
}
