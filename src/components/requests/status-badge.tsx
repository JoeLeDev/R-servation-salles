import type { RequestStatus } from "@/types/database";
import { formatStatus } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  approved: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  rejected: "bg-red-100 text-red-900 hover:bg-red-100",
  cancelled: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

type StatusBadgeProps = {
  status: RequestStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn("border-0", STATUS_STYLES[status])}>
      {formatStatus(status)}
    </Badge>
  );
}
