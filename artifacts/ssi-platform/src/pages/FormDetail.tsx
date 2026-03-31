import React, { useState } from "react";
import { useParams } from "wouter";
import { useGetForm, useSubmitForm } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";

export default function FormDetail() {
  const { id } = useParams();
  const formId = parseInt(id || "0", 10);
  const { data: form, isLoading } = useGetForm(formId, { query: { enabled: !!formId, queryKey: ['form', formId] } });
  const submitForm = useSubmitForm();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState("");

  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm.mutate({ data: { data: formData } }, {
      onSuccess: (res) => {
        setSubmitted(true);
        setRefNum(res.referenceNumber);
      }
    });
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full max-w-2xl mx-auto" /></div>;
  if (!form) return <div>Form not found</div>;

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground">Your application for {form.name} has been received.</p>
        <Card className="bg-muted/50 border-none">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{refNum}</p>
          </CardContent>
        </Card>
        <Link href="/forms">
          <Button variant="outline" className="mt-8">Return to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/forms" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to forms
      </Link>
      
      <Card>
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-2xl">{form.name}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields?.map((field) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.id} className="text-base">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.helpText && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" className="h-6 w-6 text-indigo-500 rounded-full bg-indigo-50">
                          <Sparkles className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{field.helpText}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {field.type === 'select' ? (
                  <Select onValueChange={(val) => handleChange(field.id, val)} required={field.required}>
                    <SelectTrigger id={field.id}>
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" className="flex items-center gap-2 text-indigo-600 border-indigo-200 bg-indigo-50">
                <Sparkles className="w-4 h-4" /> Auto-fill with AI
              </Button>
              <Button type="submit" disabled={submitForm.isPending}>
                {submitForm.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}