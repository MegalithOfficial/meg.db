import { DatabaseErrorOptions } from "../interfaces/DatabaseErrorOptions";

export default class DatabaseError extends Error {
  public readonly timestamp: Date;
  private readonly data: DatabaseErrorOptions;

  /**
   * Creates an instance of DatabaseError.
   * @param {DatabaseErrorOptions} [data={}] - The options for configuring the error.
   */
  public constructor(data: DatabaseErrorOptions = {}) {
    super(data?.message);

    this.name = `${this.constructor.name} Error`;
    this.timestamp = new Date();
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  };

  /**
   * Fetches the location information where the error occurred.
   * @returns {{ path: string, line: string }} - The location information.
   */
  public fetchLocation() {
    const stackLines = this.stack!.split('\n');

    if (stackLines.length > 0) {
      const matched = (stackLines[1].trim()).match(/at\s+(.*):(\d+):(\d+)/);
      if (matched) return { path: ((matched[1].split('file:///'))[1]), line: ((matched[2].split(':'))[0]) };
    };

    return { path: 'Unknown', line: 'Unknown' };
  };

  /**
   * Overrides the default `toString` method to provide a formatted error message.
   * @returns {Error | string | any} - The formatted error message or the original stack trace.
   */
  public override toString(): Error | string | any {
    if (this.data?.expected && this.data?.received) {
      const location = this.fetchLocation();
      const formattedTimestamp = this.timestamp.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });

      return new Error(`ValidationError > ${this.data.expected}\n- Expected a ${this.data.expected} primitive.\n\nReceived:\n | ${this.data.received}\n\nInformations\n- File: ${location.path}\n- Line: ${location.line}\n\n- Additional: ${JSON.stringify(this.data)}\n- Time: ${formattedTimestamp} (${this.timestamp.toISOString()})`);
    } else return this.stack;
  };
};