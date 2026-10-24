export interface ClubPlan {
  id: string;
  seats: number;
  discount: number;      // percentage
  pricePerMonth: number;  // EUR cents, incl. VAT
  label: string;
}

export const CLUB_PLANS: ClubPlan[] = [
  { id: 'club_5',  seats: 5,  discount: 10, pricePerMonth: 3803, label: 'Club 5' },
  { id: 'club_10', seats: 10, discount: 15, pricePerMonth: 7183, label: 'Club 10' },
  { id: 'club_15', seats: 15, discount: 20, pricePerMonth: 10140, label: 'Club 15' },
  { id: 'club_20', seats: 20, discount: 25, pricePerMonth: 12675, label: 'Club 20' },
  { id: 'club_25', seats: 25, discount: 30, pricePerMonth: 14787, label: 'Club 25' },
  { id: 'club_30', seats: 30, discount: 35, pricePerMonth: 16477, label: 'Club 30' },
  { id: 'club_35', seats: 35, discount: 40, pricePerMonth: 17745, label: 'Club 35' },
  { id: 'club_40', seats: 40, discount: 45, pricePerMonth: 18590, label: 'Club 40' },
  { id: 'club_45', seats: 45, discount: 48, pricePerMonth: 19773, label: 'Club 45' },
  { id: 'club_50', seats: 50, discount: 55, pricePerMonth: 19013, label: 'Club 50' },
];

export function getClubPlan(id: string): ClubPlan | undefined {
  return CLUB_PLANS.find(p => p.id === id);
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function pricePerPlayer(plan: ClubPlan): string {
  return `€${((plan.pricePerMonth / 100) / plan.seats).toFixed(2)}`;
}
