"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function ReviewsFilters({ search, onSearchChange, status, onStatusChange }: ReviewsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative w-full sm:w-80">
        <Input
          placeholder="Search by author, product, or content..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-4"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reviews</SelectItem>
          <SelectItem value="pending">Pending Approval</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
