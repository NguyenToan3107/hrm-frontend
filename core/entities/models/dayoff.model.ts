export class DayOff {
  constructor(
    public id?: string,
    public title?: string,
    public description?: string,
    public day_off?: string,
    public status?: "0" | "1" | "none",
    public updated_at?: string
  ) {}
}
