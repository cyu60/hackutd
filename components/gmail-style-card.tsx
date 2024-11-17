"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GmailStyleCard() {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="border-b p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="JD" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Jane Doe</h2>
            <p className="text-sm text-gray-500">
              jane.doe@acmeconsumergoods.com
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">
          Inquiry About Pinata&apos;s IPFS Storage Solutions
        </h3>
        <ScrollArea className="h-64 rounded-md border p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            Dear Piñata Team, I am the Operations Manager at Acme Consumer
            Goods, and we are exploring solutions to improve our data storage
            and management processes. We face challenges with data
            accessibility, security, and scalability. Could you please provide
            more information on how Pinata&apos;s platform can assist us in
            overcoming these challenges? Additionally, we would like to
            understand the implementation process and any support services you
            offer. Looking forward to your response. Best regards, Jane Doe
            Operations Manager Acme Consumer Goods
            jane.doe@acmeconsumergoods.com (555) 123-4567
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
