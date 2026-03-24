export interface SecParameters {
  id: number;
  effectiveStart: string;
  effectiveEnd: string;
  fuelType: string;
  active: boolean;
  groupId?: number;
}

export interface ReferenceResponse<Reference> {
  data: Reference[];
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  hasMore: boolean;
}

export interface Reference {
  desc: string;
  label: string;
  status: boolean;
  code: string;
  type: string;
}
