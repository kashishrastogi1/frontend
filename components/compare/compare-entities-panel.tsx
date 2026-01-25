import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Building2, FileText } from "lucide-react"
import { extractLinkAndCleanTitle } from "@/lib/utils/extractLinkAndCleanTitle"

export function CompareEntitiesPanel({
  companies,
  publications,
  patents,
}: {
  companies: any[]
  publications: any[]
  patents: any[]
}) {
  return (
    <div className="space-y-6">
      {/* ================= COMPANIES ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Related Companies</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Key players in the ecosystem
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 pr-1">
          {companies.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No companies available
            </p>
          )}

          {companies.map((company, i) => (
            <div
              key={i}
              className="p-2 rounded-md border border-border/30 bg-secondary/30"
            >
              {company.link ? (
                <a
                  href={company.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {company.name}
                </a>
              ) : (
                <p className="text-sm font-medium">{company.name}</p>
              )}

              {company.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {company.description}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= PUBLICATIONS ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <CardTitle className="text-base">Publications</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Research & analysis sources
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {publications.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No publications available
            </p>
          )}

          {publications.map((pub, i) => {
            const extracted = extractLinkAndCleanTitle(pub.title)
            const link = pub.link || extracted.link
            const title = extracted.cleanTitle || pub.title

            return (
              <div
                key={i}
                className="p-2 rounded-md border border-border/30 bg-secondary/30"
              >
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {title}
                  </a>
                ) : (
                  <p className="text-sm">{title}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ================= PATENTS ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <CardTitle className="text-base">Patents</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Key filed patents (ML-derived)
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {patents.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No patents available
            </p>
          )}

          {patents.map((patent, i) => (
            <div
              key={i}
              className="p-2 rounded-md border border-border/30 bg-secondary/30"
            >
              {patent.link ? (
                <a
                  href={patent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {patent.title}
                </a>
              ) : (
                <p className="text-sm font-medium">{patent.title}</p>
              )}

              {patent.year && (
                <p className="text-xs text-muted-foreground">
                  Year: {patent.year} · TRL: {patent.trl ?? "N/A"}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
