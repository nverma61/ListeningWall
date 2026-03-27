"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  setReportStatus,
  setPostModeration,
  setCommentModeration,
} from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";

type Row = {
  id: string;
  target_type: string;
  target_id: string;
  reason_code: string;
  status: string;
  created_at: string;
};

export function AdminReportsTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const { toast } = useToast();

  async function resolve(
    row: Row,
    status: "resolved" | "dismissed",
    hideContent: boolean
  ) {
    try {
      await setReportStatus(row.id, status);
      if (hideContent) {
        if (row.target_type === "post") {
          await setPostModeration(row.target_id, "hidden");
        }
        if (row.target_type === "comment") {
          await setCommentModeration(row.target_id, "hidden");
        }
      }
      setRows((r) => r.filter((x) => x.id !== row.id));
      toast({ title: "Updated" });
    } catch (e) {
      toast({
        title: "Action failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>When</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No reports loaded. Check service role key, or you are all caught up.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.target_type}</TableCell>
                <TableCell>{row.reason_code}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolve(row, "dismissed", false)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => resolve(row, "resolved", true)}
                  >
                    Hide &amp; resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
