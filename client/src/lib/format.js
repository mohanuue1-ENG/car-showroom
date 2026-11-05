const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const money = (value) => currency.format(Number(value) || 0);
export const mileage = (value) => `${new Intl.NumberFormat('en-US').format(Number(value) || 0)} mi`;

export const dateTime = (value) =>
  value ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';
export const dateOnly = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '';

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
export const TRANSMISSIONS = ['Automatic', 'Manual'];
export const BODY_TYPES = ['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Pickup', 'Van'];
export const CONDITIONS = ['new', 'used'];
export const CAR_STATUSES = ['available', 'reserved', 'sold'];
// Statuses an admin can pick in the form (sold is set through the sale action)
export const CAR_STATUSES_FORM = ['available', 'reserved'];

export const INQUIRY_STATUS_LABELS = {
  new: 'New',
  in_progress: 'In progress',
  responded: 'Responded',
  closed: 'Closed',
};
export const TEST_DRIVE_STATUS_LABELS = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
export const INQUIRY_STATUSES = Object.keys(INQUIRY_STATUS_LABELS);
export const TEST_DRIVE_STATUSES = Object.keys(TEST_DRIVE_STATUS_LABELS);

export const carTitle = (c) => `${c.year} ${c.make} ${c.model}`;
