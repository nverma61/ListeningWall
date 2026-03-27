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
import { setUserBan, setUserMute } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";

type Row = {
  id: string;
  username: string;
  role_type: string;
  is_banned: boolean;
  is_muted: boolean;
  created_at: string;
};

export function UserAdminTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const { toast } = useToast();

  async function ban(id: string, banned: boolean) {
    try {
      await setUserBan(id, banned);
      setRows((r) => r.map((x) => (x.id === id ? { ...x, is_banned: banned } : x)));
      toast({ title: banned ? "Banned" : "Unbanned" });
    } catch (e) {
      toast({
        title: "Failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function mute(id: string, muted: boolean) {
    try {
      await setUserMute(id, muted);
      setRows((r) => r.map((x) => (x.id === id ? { ...x, is_muted: muted } : x)));
      toast({ title: muted ? "Muted" : "Unmuted" });
    } catch (e) {
      toast({
        title: "Failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No users loaded. Configure service role key.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>@{row.username}</TableCell>
                <TableCell>{row.role_type}</TableCell>
                <TableCell className="text-xs">
                  {row.is_banned ? "Banned " : ""}
                  {row.is_muted ? "Muted" : ""}
                  {!row.is_banned && !row.is_muted ? "OK" : ""}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => mute(row.id, !row.is_muted)}>
                    Toggle mute
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => ban(row.id, !row.is_banned)}
                  >
                    Toggle ban
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
