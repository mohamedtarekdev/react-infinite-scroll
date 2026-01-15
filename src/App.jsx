import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState([]);

  const [hasMore, setHasMore] = useState(false);

  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setBooks([]);
  }, [query]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel;
    axios({
      url: "https://openlibrary.org/search.json",
      method: "GET",
      params: {
        q: query,
        page,
        limit: 30,
      },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        setBooks((prevBooks) => {
          return [
            ...new Set([...prevBooks, ...res.data.docs.map((b) => b.title)]),
          ];
        });
        setHasMore(res.data.docs.length > 0);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(true);
      });

    return () => cancel();
  }, [query, page]);
  return (
    <>
      <div>
        <h1>Book Search</h1>
        <input
          style={{ width: "300px", height: "30px", marginBottom: "20px" }}
          type="text"
          value={query}
          onChange={handleSearch}
        />
        <div>
          {books.map((b, i) => {
            if (books.length === i + 1) {
              return (
                <div ref={lastBookElementRef} key={b}>
                  {b}
                </div>
              );
            } else {
              return <div key={b}>{b}</div>;
            }
          })}
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div>Something went wrong</div>}
    </>
  );
}

export default App;
