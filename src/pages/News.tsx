import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import NewsWidget from "@/components/widgets/NewsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const News = () => {
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">News Dashboard</h1>
        
        {isUsingMockData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using demo data. Live news feed is currently unavailable.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {/* Featured News */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Headlines</CardTitle>
            </CardHeader>
            <CardContent>
              <NewsWidget 
                className="bg-transparent shadow-none border-0" 
                category="general"
                onMockDataStateChange={(isMockData) => setIsUsingMockData(isMockData)}
              />
            </CardContent>
          </Card>
          
          {/* Categories Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['technology', 'business', 'science'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.charAt(0).toUpperCase() + category.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <NewsWidget 
                    className="bg-transparent shadow-none border-0" 
                    category={category}
                    onMockDataStateChange={(isMockData) => {
                      if (isMockData) setIsUsingMockData(true);
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default News;
