"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { trackOrderSchema, TrackOrderFormValues } from "@/schemas/track.schema";

interface TrackOrderFormProps {
  initialOrderNumber?: string;
  isLoading: boolean;
  onSubmit: (values: TrackOrderFormValues) => void;
}

export function TrackOrderForm({ initialOrderNumber = "", isLoading, onSubmit }: TrackOrderFormProps) {
  const form = useForm<TrackOrderFormValues>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: {
      orderNumber: initialOrderNumber,
    },
  });

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-0">
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ENTER ORDER NUMBER"
                    className="flex-1 px-4 py-4 border-b border-black/20 focus:border-black bg-transparent focus:outline-none placeholder:text-gray-400 text-sm uppercase tracking-widest transition-colors h-auto rounded-none border-x-0 border-t-0 shadow-none ring-offset-0 focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="premium"
            disabled={isLoading}
            className="rounded-none cursor-pointer min-w-[160px] h-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                SEARCHING...
              </span>
            ) : (
              "TRACK ORDER"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
