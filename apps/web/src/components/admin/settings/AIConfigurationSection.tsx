"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Sparkles, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SettingsFormValues } from "@/schemas/settings.schema";
import { aiService } from "@/services/ai.service";

interface AIConfigurationSectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

const AI_PROVIDERS = [
  { value: "DISABLED", label: "Disabled", description: "AI features turned off" },
  { value: "GROQ", label: "Groq", description: "Fastest response, Llama 3.2 Vision" },
  { value: "OPENROUTER", label: "OpenRouter", description: "Access to Gemini 2.0 Flash (Free)" },
  { value: "GEMINI", label: "Google Gemini", description: "1500 requests/day free" },
];

export function AIConfigurationSection({ form }: AIConfigurationSectionProps) {
  const [showPrimaryKey, setShowPrimaryKey] = useState(false);
  const [showFallbackKey, setShowFallbackKey] = useState(false);
  const [testingPrimary, setTestingPrimary] = useState(false);
  const [testingFallback, setTestingFallback] = useState(false);
  const [primaryStatus, setPrimaryStatus] = useState<"idle" | "success" | "error">("idle");
  const [fallbackStatus, setFallbackStatus] = useState<"idle" | "success" | "error">("idle");

  const testConnection = async (type: "primary" | "fallback") => {
    const provider = type === "primary" ? form.getValues("aiProvider") : form.getValues("aiFallbackProvider");
    const apiKey = type === "primary" ? form.getValues("aiApiKey") : form.getValues("aiFallbackApiKey");

    if (!provider || provider === "DISABLED") {
      toast.error("Please select a provider first");
      return;
    }
    if (!apiKey) {
      toast.error("Please enter an API key");
      return;
    }

    const setTesting = type === "primary" ? setTestingPrimary : setTestingFallback;
    const setStatus = type === "primary" ? setPrimaryStatus : setFallbackStatus;

    setTesting(true);
    setStatus("idle");

    try {
      const result = await aiService.testConnection({ provider, apiKey });
      if (result.success) {
        setStatus("success");
        toast.success(`${provider} connected successfully!`);
      } else {
        setStatus("error");
        toast.error(result.message || "Connection failed");
      }
    } catch (error: any) {
      setStatus("error");
      toast.error(error.message || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const primaryProvider = form.watch("aiProvider");
  const fallbackProvider = form.watch("aiFallbackProvider");

  return (
    <div className="pb-12 border-b border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-medium tracking-tight">AI Product Generator</h2>
          <p className="text-sm text-muted-foreground">Generate product descriptions from images using AI vision</p>
        </div>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Primary Provider */}
        <div className="p-6 border border-gray-100 bg-gray-50/50 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Primary Provider</h3>

          <FormField
            control={form.control}
            name="aiProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Provider</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {primaryProvider && primaryProvider !== "DISABLED" && (
            <FormField
              control={form.control}
              name="aiApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">API Key</FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPrimaryKey ? "text" : "password"}
                          placeholder="Enter your API key"
                          className="pr-10 rounded-none border-gray-200"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPrimaryKey(!showPrimaryKey)}
                      >
                        {showPrimaryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      disabled={testingPrimary}
                      onClick={() => testConnection("primary")}
                    >
                      {testingPrimary ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : primaryStatus === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : primaryStatus === "error" ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                  <FormDescription className="text-xs">
                    {primaryProvider === "GROQ" && "Get your key at console.groq.com"}
                    {primaryProvider === "OPENROUTER" && "Get your key at openrouter.ai/keys"}
                    {primaryProvider === "GEMINI" && "Get your key at aistudio.google.com"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Fallback Provider */}
        <div className="p-6 border border-gray-100 bg-gray-50/50 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Fallback Provider (Optional)</h3>
          <p className="text-xs text-muted-foreground">Used automatically if the primary provider fails or is rate-limited</p>

          <FormField
            control={form.control}
            name="aiFallbackProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Provider</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select fallback provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {fallbackProvider && fallbackProvider !== "DISABLED" && (
            <FormField
              control={form.control}
              name="aiFallbackApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">API Key</FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          type={showFallbackKey ? "text" : "password"}
                          placeholder="Enter your API key"
                          className="pr-10 rounded-none border-gray-200"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowFallbackKey(!showFallbackKey)}
                      >
                        {showFallbackKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      disabled={testingFallback}
                      onClick={() => testConnection("fallback")}
                    >
                      {testingFallback ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : fallbackStatus === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : fallbackStatus === "error" ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                  <FormDescription className="text-xs">
                    {fallbackProvider === "GROQ" && "Get your key at console.groq.com"}
                    {fallbackProvider === "OPENROUTER" && "Get your key at openrouter.ai/keys"}
                    {fallbackProvider === "GEMINI" && "Get your key at aistudio.google.com"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
