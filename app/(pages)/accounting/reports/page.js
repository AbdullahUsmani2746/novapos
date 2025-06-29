// app/reports/page.jsx
import { REPORT_CONFIG } from '@/components/Reports/config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, BarChart3, PieChart, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Icon mapping for different report types
const getReportIcon = (key) => {
  const iconMap = {
    analytics: TrendingUp,
    performance: BarChart3,
    users: Users,
    financial: PieChart,
    activity: Calendar,
    default: FileText
  };
  
  const IconComponent = iconMap[key] || iconMap.default;
  return <IconComponent className="h-6 w-6 text-white" />;
};

// Status badge colors
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'draft': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default: return 'bg-primary text-primary hover:bg-primary';
  }
};

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Comprehensive insights and detailed reporting suite
                </p>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {Object.keys(REPORT_CONFIG).length} Reports Available
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        {/* <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="hover:bg-primary hover:border-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div> */}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(REPORT_CONFIG).map(([key, report]) => (
            <Card 
              key={key} 
              className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary rounded-xl group-hover:from-primary group-hover:to-primary transition-all duration-300">
                      {getReportIcon(key)}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {report.title}
                      </CardTitle>
                      {report.status && (
                        <Badge 
                          variant="secondary" 
                          className={`mt-2 text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardDescription className="text-gray-600 leading-relaxed mt-3">
                  {report.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative pt-0">
                {/* Report Metrics */}
                {report.metrics && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {report.metrics.map((metric, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                        <div className="text-xs text-gray-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Last Updated */}
                {report.lastUpdated && (
                  <div className="text-xs text-gray-500 mb-4">
                    Last updated: {report.lastUpdated}
                  </div>
                )}
              </CardContent>

              <CardFooter className="relative pt-4 border-t border-gray-100">
                <Link href={`/accounting/reports/${key}`} className="w-full">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white font-medium py-2.5 transition-all duration-300 group-hover:shadow-lg"
                    size="default"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>View Report</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </CardFooter>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {Object.keys(REPORT_CONFIG).length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 mb-6">Reports will appear here once they are configured.</p>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Create Your First Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;