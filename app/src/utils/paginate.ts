export type PageState<T> = {
  page: number;
  limit: number;
  items: T[];
  hasMore: boolean;
  loading: boolean;
  error?: string;
};

export function initPageState<T>(limit = 20): PageState<T> {
  return { page: 1, limit, items: [], hasMore: true, loading: false };
}

export async function loadNextPage<T>(
  state: PageState<T>,
  setState: (s: PageState<T>) => void,
  fetcher: (page: number, limit: number) => Promise<{ data: T[] } | { items?: T[]; data?: T[] }>
) {
  if (state.loading || !state.hasMore) return;
  setState({ ...state, loading: true, error: undefined });
  try {
    const nextPage = state.page;
    const resp = await fetcher(nextPage, state.limit);
    const data = (resp as any).data || (resp as any).items || [];
    const merged = [...state.items, ...data];
    const hasMore = data.length >= state.limit; // simple heuristique
    setState({ ...state, page: nextPage + 1, items: merged, hasMore, loading: false });
  } catch (e: any) {
    setState({ ...state, loading: false, error: e?.message || 'Erreur' });
  }
}
