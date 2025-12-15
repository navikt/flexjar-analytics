import { LinkIcon } from "@navikt/aksel-icons";
import { Heading, Table } from "@navikt/ds-react";
import { useStats } from "~/lib/useStats";

export function UrgentUrls() {
  const { data: stats } = useStats();

  if (
    !stats?.lowestRatingPaths ||
    Object.keys(stats.lowestRatingPaths).length === 0
  ) {
    return null;
  }

  const urls = Object.entries(stats.lowestRatingPaths)
    .map(([path, data]) => ({
      path,
      count: data.count,
      average: data.averageRating,
    }))
    .sort((a, b) => a.average - b.average);

  return (
    <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
      <div className="dashboard-card-header">
        <Heading
          size="small"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <LinkIcon aria-hidden /> Sider med lavest score
        </Heading>
      </div>

      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>URL / Path</Table.HeaderCell>
            <Table.HeaderCell align="right">Snitt</Table.HeaderCell>
            <Table.HeaderCell align="right">Antall</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {urls.map((row) => (
            <Table.Row key={row.path}>
              <Table.DataCell>
                <a
                  href={
                    row.path.startsWith("http")
                      ? row.path
                      : `https://www.nav.no${row.path}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "var(--ax-text-accent)",
                  }}
                >
                  {row.path}
                </a>
              </Table.DataCell>
              <Table.DataCell align="right">
                {row.average.toFixed(1)}
              </Table.DataCell>
              <Table.DataCell align="right">{row.count}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
