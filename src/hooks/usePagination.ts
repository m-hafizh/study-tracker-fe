export type PaginationResult<T> = {
    page: number;
    totalItems: number;
    totalPages: number;
    paginatedData: T[];
    next: () => void;
    prev: () => void;
    goto: (page: number) => void;
    setPage: (page: number) => void;
};

export function usePagination<T>(data: T[], itemsPerPage = 5): PaginationResult<T> {
    const [page, setPage] = useState<number>(1);

    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        // if data shrinks, ensure page stays in range
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [data, page, itemsPerPage]);

    const next = useCallback(() => setPage(p => Math.min(p + 1, totalPages)), [totalPages]);
    const prev = useCallback(() => setPage(p => Math.max(p - 1, 1)), []);
    const goto = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

    return { page, totalItems, totalPages, paginatedData, next, prev, goto, setPage };
}