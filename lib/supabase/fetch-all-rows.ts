/** PostgREST / Supabase devuelve como máximo 1000 filas por request. */
const SUPABASE_MAX_ROWS = 1000;

type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export async function fetchAllRows<T>(
  fetchPage: (range: { from: number; to: number }) => Promise<PageResult<T>>,
): Promise<{ data: T[]; error: string | null }> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + SUPABASE_MAX_ROWS - 1;
    const { data, error } = await fetchPage({ from, to });
    if (error) {
      return { data: [], error: error.message };
    }

    const page = data ?? [];
    rows.push(...page);
    if (page.length < SUPABASE_MAX_ROWS) {
      break;
    }
    from += SUPABASE_MAX_ROWS;
  }

  return { data: rows, error: null };
}
