"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Cloud, Package } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/img/logo.png";

export function B2bSalesPractice() {
  const [isAdminView, setIsAdminView] = useState(false);

  const scenarios = [
    {
      title: "Pinata",
      description: "IPFS pinning service",
      icon: <Package className="w-6 h-6" />,
      difficulty: "Medium",
      href: "/pinata",
    },
    {
      title: "SambaNova AI Cloud",
      description: "AI and machine learning platform",
      icon: <Cloud className="w-6 h-6" />,
      difficulty: "Hard",
      href: "/sambanova",
    },
  ];

  return (
    <div className="min-h-screen bg-[#efefef] dark:bg-gray-900">
      <header className="dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* <Drill className="w-8 h-8 text-primary" /> */}
            <a href="/dashboard" className="flex items-center space-x-2">
              <Image src={Logo} alt="DealDrill Logo" width={32} height={32} />
              <h1 className="text-2xl font-bold text-black dark:text-white">
                DealDrill
              </h1>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-black dark:text-gray-300">
              Admin View
            </span>
            <Switch
              checked={isAdminView}
              onCheckedChange={setIsAdminView}
              className="color-[#163286]"
              aria-label="Toggle admin view"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl text-center font-semibold mb-6 text-gray-800 dark:text-gray-200">
          {isAdminView ? "Manage Scenarios" : "Practice Your Pitch"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario, index) => (
            <Card
              key={index}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <a href={scenario.href} className="flex flex-col flex-grow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {scenario.icon}
                      <CardTitle>{scenario.title}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        scenario.difficulty === "Medium"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        scenario.difficulty === "Medium"
                          ? "bg-custom-medium"
                          : ""
                      }
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-400">
                    {isAdminView
                      ? "Admin: Customize this scenario's details and challenges."
                      : "Drill your B2B sales pitch for this scenario and sharpen your skills."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    {isAdminView ? "Edit Scenario" : "Start Drilling"}
                  </Button>
                </CardFooter>
              </a>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
