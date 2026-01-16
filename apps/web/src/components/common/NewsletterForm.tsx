"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { newsletterSchema, NewsletterFormValues } from "@/schemas/newsletter.schema";

interface NewsletterFormProps {
  isLoading: boolean;
  onSubmit: (values: NewsletterFormValues) => void;
}

export function NewsletterForm({ isLoading, onSubmit }: NewsletterFormProps) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 px-4 text-sm border border-gray-200 focus:border-black focus:ring-0 rounded-none transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="premium" disabled={isLoading} className="w-full h-12 rounded-none">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              SUBSCRIBING...
            </span>
          ) : (
            "SUBSCRIBE & GET 10% OFF"
          )}
        </Button>
      </form>
    </Form>
  );
}
