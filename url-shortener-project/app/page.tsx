"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setShortUrl("");
    setLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "URL 단축에 실패했습니다.");
      } else {
        setShortUrl(data.shortUrl);
      }
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>URL Shortener</h1>
        <p className="sub">긴 인터넷 주소를 짧고 간편한 링크로 바꿔보세요.</p>
        <form onSubmit={submit}>
          <label htmlFor="url">단축할 URL</label>
          <input id="url" type="url" placeholder="https://example.com" value={url}
            onChange={(e) => setUrl(e.target.value)} required />
          <button disabled={loading}>{loading ? "처리 중..." : "URL 단축하기"}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {shortUrl && <div className="result">
          <strong>단축 URL</strong><p><a href={shortUrl}>{shortUrl}</a></p>
          <button type="button" onClick={() => navigator.clipboard.writeText(shortUrl)}>복사하기</button>
        </div>}
        <p className="small">이미 단축한 URL을 다시 입력하면 기존 단축 주소를 반환합니다.</p>
      </section>
    </main>
  );
}
