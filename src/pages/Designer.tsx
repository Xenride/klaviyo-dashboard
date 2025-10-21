import { Palette, MousePointerClick, Smartphone, Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const Designer = () => {
  const topLinks = [
    { url: 'https://example.com/shop-now', clicks: 3240, ctr: 7.2 },
    { url: 'https://example.com/view-collection', clicks: 2145, ctr: 5.1 },
    { url: 'https://example.com/learn-more', clicks: 1834, ctr: 4.3 },
    { url: 'https://example.com/special-offer', clicks: 1623, ctr: 3.8 },
    { url: 'https://example.com/get-started', clicks: 1420, ctr: 3.2 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 58.3, color: 'hsl(var(--chart-1))' },
    { name: 'Mobile', value: 37.2, color: 'hsl(var(--chart-2))' },
    { name: 'Tablet', value: 4.5, color: 'hsl(var(--chart-3))' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Designer Dashboard</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Track visual performance, clicks, and device engagement
          </p>
        </div>
      </div>

      {/* Top Clicked Links */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Top Clicked Links</h2>
            <p className="text-sm text-muted-foreground">Most engaging CTAs and buttons</p>
          </div>
          <MousePointerClick className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-3">
          {topLinks.map((link, index) => (
            <div key={link.url} className="flex items-center gap-4 rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-mono text-sm text-foreground">{link.url}</p>
                <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                  <span>Clicks: <span className="font-medium text-foreground">{link.clicks.toLocaleString()}</span></span>
                  <span>CTR: <span className="font-medium text-foreground">{link.ctr}%</span></span>
                </div>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full bg-gradient-primary"
                  style={{ width: `${(link.ctr / 7.2) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Device Split */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Device Distribution</h2>
            <p className="text-sm text-muted-foreground">Opens by device type</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {deviceData.map((device) => (
              <div key={device.name} className="rounded-lg bg-card/50 p-3">
                <p className="text-2xl font-bold text-foreground">{device.value}%</p>
                <p className="text-sm text-muted-foreground">{device.name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Design Insights</h2>
            <p className="text-sm text-muted-foreground">Optimization recommendations</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Mobile-First Design</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    37% of opens happen on mobile. Ensure CTAs are thumb-friendly (min 44x44px).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Desktop Optimization</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Majority of users on desktop. Use 600px width templates for best compatibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-success/10 p-4">
              <p className="text-sm font-medium text-success">
                ✅ Tip: Test emails on both light and dark modes for optimal contrast
              </p>
            </div>

            <div className="rounded-lg bg-warning/10 p-4">
              <p className="text-sm font-medium text-warning">
                ⚠️ Alert: Low engagement on tablet devices. Consider responsive breakpoints.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA Performance */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <h2 className="mb-4 text-xl font-bold text-foreground">CTA Button Analysis</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <Badge className="mb-2 bg-gradient-primary">Primary CTA</Badge>
            <p className="text-2xl font-bold text-foreground">8.2%</p>
            <p className="text-sm text-muted-foreground">Average click rate</p>
            <p className="mt-2 text-xs text-success">+1.3% vs last period</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <Badge variant="secondary" className="mb-2">Secondary CTA</Badge>
            <p className="text-2xl font-bold text-foreground">4.7%</p>
            <p className="text-sm text-muted-foreground">Average click rate</p>
            <p className="mt-2 text-xs text-muted-foreground">Stable</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <Badge variant="outline" className="mb-2">Text Links</Badge>
            <p className="text-2xl font-bold text-foreground">2.3%</p>
            <p className="text-sm text-muted-foreground">Average click rate</p>
            <p className="mt-2 text-xs text-destructive">-0.5% vs last period</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Designer;
