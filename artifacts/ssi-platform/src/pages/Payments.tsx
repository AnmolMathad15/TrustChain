import React from "react";
import { useListBills, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Droplet, Wifi, Landmark, ArrowRightLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Payments() {
  const { data: bills, isLoading: billsLoading } = useListBills();
  const { data: transactions, isLoading: txLoading } = useListTransactions();

  if (billsLoading || txLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  const getProviderIcon = (type: string) => {
    switch(type) {
      case 'electricity': return <Zap className="text-yellow-500 w-6 h-6" />;
      case 'water': return <Droplet className="text-blue-500 w-6 h-6" />;
      case 'internet': return <Wifi className="text-indigo-500 w-6 h-6" />;
      default: return <Landmark className="text-gray-500 w-6 h-6" />;
    }
  };

  const pendingnBills = bills?.filter(b => !b.isPaid) || [];
  const totalDue = pendingnBills.reduce((acc, bill) => acc + bill.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments & Bills</h2>
          <p className="text-muted-foreground">Manage your utility bills and BHIM UPI payments.</p>
        </div>
        <Link href="/atm">
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" /> ATM Mode
          </Button>
        </Link>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-primary mb-1">Total Pending Due</p>
            <h3 className="text-4xl font-bold tracking-tight">₹{totalDue.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground mt-2">{pendingnBills.length} bills pending</p>
          </div>
          <Button size="lg" className="w-full md:w-auto h-12 px-8 text-lg shadow-lg">
            Pay All via UPI
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bills">Pending Bills</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pendingnBills.map((bill) => (
              <Card key={bill.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                    {getProviderIcon(bill.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{bill.provider}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{bill.accountNumber}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-end justify-between py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold">₹{bill.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium text-destructive">{bill.dueDate}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 bg-muted/20 border-t mt-auto px-6 py-4">
                  <Button className="w-full">Pay Now</Button>
                </CardFooter>
              </Card>
            ))}
            {pendingnBills.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                All caught up! No pending bills.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions?.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{tx.recipient}</p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="mt-1 capitalize">{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}