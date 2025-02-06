export interface SheetRow {
  assignDate: string;
  msisdn: string;
  category: string;
  statusByCallCenter: 'Open' | 'Reserved';
  statusByBackOffice: string;
  date: string;
  owner: string;
}

export interface UpdateStatusPayload {
  rowIndex: number;
  newStatus: 'Open' | 'Reserved';
}