import React, { useState } from "react";
import { useListSchemes, useCheckSchemeEligibility } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Umbrella, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Schemes() {
  const { data: schemes, isLoading } = useListSchemes();
  const [search, setSearch] = useState("");

  const filteredSchemes = schemes?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Government Schemes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schemes & Benefits</h2>
          <p className="text-muted-foreground">Find and apply for government welfare schemes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search schemes..." 
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredSchemes?.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
        {filteredSchemes?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No schemes found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const checkEligibility = useCheckSchemeEligibility(scheme.id, { query: { enabled: isOpen, queryKey: ['eligibility', scheme.id] } });

  return (
    <Card className="flex flex-col h-full border-t-4 border-t-emerald-500">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {scheme.category}
          </Badge>
          {scheme.isActive ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Closed</Badge>
          )}
        </div>
        <CardTitle className="text-xl leading-tight">{scheme.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground">{scheme.description}</p>
        
        <div className="bg-muted/50 p-4 rounded-xl space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Umbrella className="w-4 h-4 text-emerald-500" /> Key Benefits
          </p>
          <p className="text-sm">{scheme.benefits}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Check Eligibility</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eligibility Status</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              {checkEligibility.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : checkEligibility.data ? (
                <>
                  <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                    checkEligibility.data.eligible 
                      ? 'bg-green-50 border-green-200 text-green-900' 
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    {checkEligibility.data.eligible ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-lg">
                        {checkEligibility.data.eligible ? "You are eligible!" : "Not currently eligible"}
                      </h4>
                      <p className="mt-1">{checkEligibility.data.reason}</p>
                    </div>
                  </div>

                  {checkEligibility.data.requirements && checkEligibility.data.requirements.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Required Documents</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {checkEligibility.data.requirements.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button className="w-full" disabled={!checkEligibility.data.eligible}>
                      {checkEligibility.data.eligible ? "Apply Now" : "Requirements not met"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">Failed to check eligibility</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}