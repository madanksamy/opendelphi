"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Eye,
} from "lucide-react";

interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface ResponseRow {
  id: string;
  [key: string]: unknown;
}

interface ResponseTableProps {
  columns: ColumnDef[];
  data: ResponseRow[];
  pageSize?: number;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

export function ResponseTable({
  columns,
  data,
  pageSize = 10,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  className,
}: ResponseTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
      setCurrentPage(0);
    },
    [sortKey]
  );

  const filteredData = useMemo(() => {
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (val) => val != null && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const cmp =
          typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal));

        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const formatCellValue = (value: unknown): string => {
    if (value == null) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const defaultExportCSV = useCallback(() => {
    const headers = columns.map((c) => c.label);
    const rows = filteredData.map((row) =>
      columns.map((c) => {
        const val = formatCellValue(row[c.key]);
        return val.includes(",") ? `"${val}"` : val;
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "responses.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [columns, filteredData]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="Search responses..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV ?? defaultExportCSV}
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          {onExportExcel && (
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
          )}
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left w-10" />
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "p-3 text-left font-medium text-muted-foreground",
                      col.sortable && "cursor-pointer select-none hover:text-foreground"
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No responses found
                  </td>
                </tr>
              )}
              {paginatedData.map((row) => (
                <>
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedRow(expandedRow === row.id ? null : row.id)
                    }
                  >
                    <td className="p-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="p-3 max-w-[200px] truncate">
                        {col.key === "status" ? (
                          <Badge
                            variant={
                              row[col.key] === "completed"
                                ? "default"
                                : row[col.key] === "in_progress"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {formatCellValue(row[col.key])}
                          </Badge>
                        ) : (
                          formatCellValue(row[col.key])
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRow === row.id && (
                    <tr key={`${row.id}-expanded`} className="bg-muted/20">
                      <td colSpan={columns.length + 1} className="p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {columns.map((col) => (
                            <div key={col.key}>
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                                {col.label}
                              </p>
                              <p className="text-sm break-words">
                                {formatCellValue(row[col.key])}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i;
              } else if (currentPage < 3) {
                page = i;
              } else if (currentPage > totalPages - 4) {
                page = totalPages - 5 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page + 1}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
