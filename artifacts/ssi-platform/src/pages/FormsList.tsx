import React, { useState } from "react";
import { useListForms } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function FormsList() {
  const { data: forms, isLoading } = useListForms();
  const [search, setSearch] = useState("");

  const filteredForms = forms?.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Government Forms</h2>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Government Forms</h2>
          <p className="text-muted-foreground">Fill and submit applications easily.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search forms..." 
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms?.map((form) => (
          <Card key={form.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{form.category}</Badge>
                {form.isPopular && <Badge className="bg-orange-500">Popular</Badge>}
              </div>
              <CardTitle className="text-lg leading-tight">{form.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {form.description}
              </p>
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Est. time: {form.estimatedTime}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href={`/forms/${form.id}`} className="w-full">
                <Button className="w-full">Apply Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {filteredForms?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No forms found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}