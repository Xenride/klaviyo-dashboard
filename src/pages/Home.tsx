import { TrendingUp, MousePointerClick, Mail, DollarSign, AlertTriangle, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockCampaigns, mockFlows, mockTimeSeriesData, aggregateMetrics, calculateMetrics } from "@/lib/mockData";

const Home = () => {
  const metrics = aggregateMetrics();
  
  // Top performers
  const topCampaigns = [...mockCampaigns]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  const topFlows = [...mockFlows]
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Executive Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor your key marketing metrics at a glance
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Revenue"
          value={`$${(metrics.totalRevenue / 1000).toFixed(1)}k`}
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
        />
        <KPICard
          title="Open Rate"
          value={`${metrics.openRate}%`}
          change="+2.3%"
          changeType="positive"
          icon={Mail}
        />
        <KPICard
          title="Click Rate"
          value={`${metrics.clickRate}%`}
          change="+1.8%"
          changeType="positive"
          icon={MousePointerClick}
        />
        <KPICard
          title="Bounce Rate"
          value={`${metrics.bounceRate}%`}
          change="-0.3%"
          changeType="positive"
          icon={AlertTriangle}
        />
        <KPICard
          title="Spam Rate"
          value={`${metrics.spamRate}%`}
          change="-0.01%"
          changeType="positive"
          icon={AlertTriangle}
        />
        <KPICard
          title="List Growth"
          value="+2.4k"
          change="+8.2%"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* Alert Badges */}
      <div className="flex flex-wrap gap-2">
        {parseFloat(metrics.bounceRate) > 2 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            High Bounce Rate ({metrics.bounceRate}%)
          </Badge>
        )}
        {parseFloat(metrics.spamRate) > 0.1 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Elevated Spam Reports ({metrics.spamRate}%)
          </Badge>
        )}
      </div>

      {/* Trends Chart */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Performance Trends</h2>
            <p className="text-sm text-muted-foreground">Sent, Opens, Clicks, and Revenue over time</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mockTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sent" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Sent" />
            <Line type="monotone" dataKey="opens" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Opens" />
            <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Clicks" />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Campaigns */}
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-foreground">Top Campaigns</h2>
          <div className="space-y-3">
            {topCampaigns.map((campaign, index) => {
              const metrics = calculateMetrics(campaign);
              return (
                <div key={campaign.id} className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{campaign.subject}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Open: <span className="font-medium text-foreground">{metrics.openRate}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          CTR: <span className="font-medium text-foreground">{metrics.clickRate}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          RPM: <span className="font-medium text-foreground">${metrics.rpm}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">${(campaign.revenue / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Flows */}
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-foreground">Top Flows</h2>
          <div className="space-y-3">
            {topFlows.map((flow, index) => {
              const metrics = calculateMetrics(flow);
              return (
                <div key={flow.id} className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-foreground">{flow.name}</h3>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Open: <span className="font-medium text-foreground">{metrics.openRate}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          CTR: <span className="font-medium text-foreground">{metrics.clickRate}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          CTOR: <span className="font-medium text-foreground">{metrics.ctor}%</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">${(flow.revenue / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Revenue Comparison */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <h2 className="mb-4 text-xl font-bold text-foreground">Revenue by Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: 'Campaigns', revenue: mockCampaigns.reduce((sum, c) => sum + c.revenue, 0) },
            { name: 'Flows', revenue: mockFlows.reduce((sum, f) => sum + f.revenue, 0) },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Home;
