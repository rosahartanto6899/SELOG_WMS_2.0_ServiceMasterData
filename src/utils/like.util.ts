/** Escape wildcard LIKE untuk MSSQL (bracket-escape — bebas ESCAPE clause).
 *  Cegah user injek % / _ / [ sebagai wildcard. */
export const likeTerm = (s: string): string =>
  `%${s.replace(/[%_[\]]/g, (c) => `[${c}]`)}%`;
