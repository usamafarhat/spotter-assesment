export type DutyStatus = "off_duty" | "sleeper" | "driving" | "on_duty";

export type StopType = "" | "pickup" | "delivery" | "fuel" | "rest";

export interface DutySegmentDto {
  id: number;
  sequence: number;
  duty_status: DutyStatus;
  stop_type: StopType;
  started_at: string;
  ended_at: string;
  miles_at_start: string | null;
  miles_at_end: string | null;
  latitude: string | null;
  longitude: string | null;
}
