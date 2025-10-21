import { Users, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockCampaigns, mockFlows } from "@/lib/mockData";

const AccountManager = () => {
  const totalCampaignRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalFlowRevenue = mockFlows.reduce((sum, f) => sum + f.revenue, 0);
  const totalRevenue = totalCampaignRevenue + totalFlowRevenue;

  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalBounces = mockCampaigns.reduce((sum, c) => sum + c.bounces, 0);
  const totalSpam = mockCampaigns.reduce((sum, c) => sum + c.spam, 0);
  const totalUnsub = mockCampaigns.reduce((sum, c) => sum + c.unsubscribes, 0);

  const deliverabilityData = [
    { name: 'Delivered', value: totalSent - totalBounces },
    { name: 'Bounces', value: totalBounces },
    { name: 'Spam', value: totalSpam },
    { name: 'Unsub', value: totalUnsub },
  ];

  const listGrowthData = [
    { month: 'Oct', subscribed: 1240, unsubscribed: 89 },
    { month: 'Nov', subscribed: 1580, unsubscribed: 112 },
    { month: 'Dec', subscribed: 1820, unsubscribed: 134 },
    { month: 'Jan', subscribed: 2140, unsubscribed: 156 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Account Manager Dashboard</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Revenue, deliverability, and list health metrics
          </p>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <KPICard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          change="+15.3%"
          changeType="positive"
          icon={DollarSign}
        />
        <KPICard
          title="Campaign Revenue"
          value={`$${(totalCampaignRevenue / 1000).toFixed(1)}k`}
          change="+12.8%"
          changeType="positive"
          icon={TrendingUp}
        />
        <KPICard
          title="Flow Revenue"
          value={`$${(totalFlowRevenue / 1000).toFixed(1)}k`}
          change="+22.1%"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Dashboard */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Revenue by Source</h2>
            <p className="text-sm text-muted-foreground">Campaigns vs Flows performance</p>
          </div>
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: 'Campaigns', revenue: totalCampaignRevenue },
            { name: 'Flows', revenue: totalFlowRevenue },
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
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-card/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {((totalCampaignRevenue / totalRevenue) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Campaign Share</p>
          </div>
          <div className="rounded-lg bg-card/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {((totalFlowRevenue / totalRevenue) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Flow Share</p>
          </div>
        </div>
      </Card>

      {/* Deliverability Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Deliverability Health</h2>
              <p className="text-sm text-muted-foreground">Email delivery metrics</p>
            </div>
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deliverabilityData}>
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
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bounce Rate</span>
              <Badge variant={totalBounces / totalSent > 0.02 ? "destructive" : "secondary"}>
                {((totalBounces / totalSent) * 100).toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spam Rate</span>
              <Badge variant={totalSpam / totalSent > 0.001 ? "destructive" : "secondary"}>
                {((totalSpam / totalSent) * 100).toFixed(3)}%
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">List Growth & Hygiene</h2>
            <p className="text-sm text-muted-foreground">Subscriber trends over time</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={listGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
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
              <Line type="monotone" dataKey="subscribed" stroke="hsl(var(--success))" strokeWidth={2} name="Subscribed" />
              <Line type="monotone" dataKey="unsubscribed" stroke="hsl(var(--destructive))" strokeWidth={2} name="Unsubscribed" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-2xl font-bold text-success">+6.8k</p>
              <p className="text-xs text-muted-foreground">New Subscribers</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-2xl font-bold text-destructive">-491</p>
              <p className="text-xs text-muted-foreground">Unsubscribes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts & Recommendations */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <h2 className="mb-4 text-xl font-bold text-foreground">Alerts & Recommendations</h2>
        <div className="space-y-3">
          {((totalBounces / totalSent) * 100) > 2 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">High Bounce Rate Detected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bounce rate of {((totalBounces / totalSent) * 100).toFixed(2)}% exceeds recommended threshold of 2%. 
                    Consider list cleaning and email verification.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-lg border border-success/50 bg-success/10 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <h3 className="font-semibold text-success">Strong Revenue Growth</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revenue is up 15.3% compared to last period. Flow automation is performing exceptionally well.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">List Hygiene Reminder</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Regular list cleaning recommended. Remove inactive subscribers (180+ days) to improve engagement metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountManager;
