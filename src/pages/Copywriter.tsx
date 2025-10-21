import { PenTool, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCampaigns, calculateMetrics } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Copywriter = () => {
  const campaignsWithMetrics = mockCampaigns.map(campaign => ({
    ...campaign,
    ...calculateMetrics(campaign),
  })).sort((a, b) => parseFloat(b.openRate) - parseFloat(a.openRate));

  const abTestData = [
    { variant: 'A: Emoji in Subject', openRate: 35.2, ctor: 21.4 },
    { variant: 'B: No Emoji', openRate: 31.8, ctor: 19.2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PenTool className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Copywriter Dashboard</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Analyze subject lines, CTAs, and messaging performance
          </p>
        </div>
      </div>

      {/* Subject Line Leaderboard */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Subject Line Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top performing subject lines by engagement</p>
          </div>
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-3">
          {campaignsWithMetrics.map((campaign, index) => {
            const hasEmoji = /\p{Emoji}/u.test(campaign.subject);
            const isLong = campaign.subject.length > 45;
            
            return (
              <div key={campaign.id} className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{campaign.preheader}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hasEmoji && <Badge variant="secondary">📱 Has Emoji</Badge>}
                      {isLong && <Badge variant="outline" className="border-warning text-warning">⚠️ Long ({campaign.subject.length} chars)</Badge>}
                      <Badge variant="outline">{campaign.name}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Open Rate</p>
                        <p className="font-semibold text-foreground">{campaign.openRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CTOR</p>
                        <p className="font-semibold text-foreground">{campaign.ctor}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">RPM</p>
                        <p className="font-semibold text-foreground">${campaign.rpm}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-success">${(campaign.revenue / 1000).toFixed(1)}k</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* A/B Test Comparison */}
      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">A/B Test Comparison</h2>
            <p className="text-sm text-muted-foreground">Subject line variant performance</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={abTestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="variant" 
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
            <Bar dataKey="openRate" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} name="Open Rate %" />
            <Bar dataKey="ctor" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} name="CTOR %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 rounded-lg bg-success/10 p-4">
          <p className="text-sm font-medium text-success">
            ✅ Insight: Subject lines with emojis show 10.7% higher open rates on average
          </p>
        </div>
      </Card>

      {/* Copywriting Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h3 className="mb-3 font-semibold text-foreground">📝 Best Practices</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <span>Keep subject lines under 45 characters for mobile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <span>Use emojis strategically to increase open rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <span>Create urgency with time-sensitive language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <span>Personalize preheaders to complement subjects</span>
            </li>
          </ul>
        </Card>

        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h3 className="mb-3 font-semibold text-foreground">⚠️ Words to Avoid</h3>
          <div className="flex flex-wrap gap-2">
            {['FREE!!!', 'ACT NOW', 'LIMITED TIME!!!', 'URGENT', 'Click Here', '$$$'].map(word => (
              <Badge key={word} variant="destructive">{word}</Badge>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            These spam-trigger words can hurt deliverability and open rates
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Copywriter;
