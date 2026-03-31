import React from "react";
import { useListDocuments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DigiLocker</h2>
          <p className="text-muted-foreground">Secure access to your verified documents.</p>
        </div>
        <Button>Add Document</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {documents?.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{doc.name}</CardTitle>
                  <p className="text-sm font-mono text-muted-foreground">{doc.documentNumber}</p>
                </div>
                <Badge variant={doc.status === 'Verified' ? 'default' : 'secondary'}>
                  {doc.status}
                </Badge>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground capitalize">{doc.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Issued On</p>
                    <p className="font-medium">{doc.issuedDate || 'N/A'}</p>
                  </div>
                  {doc.expiryDate && (
                    <div>
                      <p className="text-muted-foreground mb-1">Valid Till</p>
                      <p className="font-medium">{doc.expiryDate}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex gap-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button variant="secondary" className="w-full flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                  <Sparkles className="h-4 w-4" /> AI Explain
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}