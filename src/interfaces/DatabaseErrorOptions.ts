export interface DatabaseErrorOptions {
  /**
   * Error Message.
   */
  message?: string;

  /**
   * Expected Parameter Type.
   */
  expected?: string;

  /**
   * Received Parameter Type.
   */
  received?: string;
};