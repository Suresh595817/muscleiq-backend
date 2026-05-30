export interface AnalyticsData {
  id: string; // UUID
  user_id: string; // UUID
  metric_name: string;
  metric_value: number;
  recorded_at: Date;
}
