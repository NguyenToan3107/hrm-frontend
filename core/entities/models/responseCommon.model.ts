export class CommonResponse {
  constructor(
    public code: string | number,
    public message: string,
    public requestStatus: number,
    public data: any,
    public errorCode?: string | number,
    public totalItem?: number
  ) {}
}
