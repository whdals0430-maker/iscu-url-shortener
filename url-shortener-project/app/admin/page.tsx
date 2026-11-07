import { ensureSchema, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type UrlRow = {
  short_code: string;
  original_url: string;
  click_count: number;
  last_clicked_at: string | null;
  created_at: string;
};

export default async function AdminPage() {
  let rows: UrlRow[] = [];
  let totalClicks = 0;
  try {
    await ensureSchema();
    rows = await sql`
      SELECT short_code, original_url, click_count, last_clicked_at, created_at
      FROM urls ORDER BY created_at DESC LIMIT 100
    ` as UrlRow[];
    totalClicks = rows.reduce((sum, row) => sum + Number(row.click_count), 0);
  } catch {
    return <main className="container"><section className="panel"><h1>관리자 통계</h1><p>데이터베이스 연결을 확인해 주세요.</p></section></main>;
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>관리자 통계</h1>
        <p className="sub">최근 생성된 단축 URL 최대 100개를 표시합니다.</p>
        <p><strong>전체 클릭 수(표시된 URL 기준):</strong> {totalClicks}</p>
        <table>
          <thead><tr><th>Short Code</th><th>원본 URL</th><th>클릭 수</th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr key={row.short_code}>
              <td><a href={`/${row.short_code}`}>{row.short_code}</a></td>
              <td>{row.original_url}</td>
              <td>{row.click_count}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
