// Mock data for demonstration purposes

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  sent: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  spam: number;
  revenue: number;
  sentDate: string;
}

export interface Flow {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  revenue: number;
}

export interface TimeSeriesData {
  date: string;
  sent: number;
  opens: number;
  clicks: number;
  revenue: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "camp_001",
    name: "Holiday Sale 2024",
    subject: "🎄 Get 40% OFF Everything - Holiday Sale Ends Tonight!",
    preheader: "Last chance for massive savings on all products",
    sent: 45230,
    delivered: 44100,
    uniqueOpens: 15435,
    uniqueClicks: 3240,
    bounces: 1130,
    unsubscribes: 89,
    spam: 12,
    revenue: 89420,
    sentDate: "2024-01-15",
  },
  {
    id: "camp_002",
    name: "New Product Launch",
    subject: "Introducing Our Revolutionary New Product Line",
    preheader: "Be the first to experience innovation",
    sent: 38920,
    delivered: 37850,
    uniqueOpens: 11930,
    uniqueClicks: 2145,
    bounces: 1070,
    unsubscribes: 45,
    spam: 8,
    revenue: 64230,
    sentDate: "2024-01-12",
  },
  {
    id: "camp_003",
    name: "Weekly Newsletter #23",
    subject: "Your Weekly Roundup: Tips, Trends & Special Offers",
    preheader: "Don't miss this week's exclusive content",
    sent: 52100,
    delivered: 50890,
    uniqueOpens: 18320,
    uniqueClicks: 4130,
    bounces: 1210,
    unsubscribes: 67,
    spam: 15,
    revenue: 45680,
    sentDate: "2024-01-10",
  },
  {
    id: "camp_004",
    name: "Flash Sale Alert",
    subject: "⚡ 24-Hour Flash Sale: Up to 50% OFF",
    preheader: "Hurry! These deals won't last long",
    sent: 41230,
    delivered: 40100,
    uniqueOpens: 16840,
    uniqueClicks: 4230,
    bounces: 1130,
    unsubscribes: 92,
    spam: 18,
    revenue: 102340,
    sentDate: "2024-01-08",
  },
  {
    id: "camp_005",
    name: "Customer Appreciation",
    subject: "Thank You! Here's an Exclusive Gift Just for You 💝",
    preheader: "Our way of saying thanks for being awesome",
    sent: 35840,
    delivered: 34920,
    uniqueOpens: 13240,
    uniqueClicks: 2840,
    bounces: 920,
    unsubscribes: 38,
    spam: 6,
    revenue: 38920,
    sentDate: "2024-01-05",
  },
];

export const mockFlows: Flow[] = [
  {
    id: "flow_001",
    name: "Welcome Series",
    sent: 12340,
    delivered: 12100,
    uniqueOpens: 7260,
    uniqueClicks: 2420,
    bounces: 240,
    unsubscribes: 45,
    revenue: 45680,
  },
  {
    id: "flow_002",
    name: "Abandoned Cart",
    sent: 8920,
    delivered: 8670,
    uniqueOpens: 4335,
    uniqueClicks: 1734,
    bounces: 250,
    unsubscribes: 23,
    revenue: 78940,
  },
  {
    id: "flow_003",
    name: "Post-Purchase Follow-up",
    sent: 6540,
    delivered: 6410,
    uniqueOpens: 3845,
    uniqueClicks: 1283,
    bounces: 130,
    unsubscribes: 18,
    revenue: 23450,
  },
];

export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: "2024-01-01", sent: 12500, opens: 4375, clicks: 875, revenue: 15420 },
  { date: "2024-01-02", sent: 13200, opens: 4620, clicks: 924, revenue: 16890 },
  { date: "2024-01-03", sent: 11800, opens: 4130, clicks: 826, revenue: 14230 },
  { date: "2024-01-04", sent: 14500, opens: 5075, clicks: 1015, revenue: 18920 },
  { date: "2024-01-05", sent: 15200, opens: 5320, clicks: 1064, revenue: 20340 },
  { date: "2024-01-06", sent: 13900, opens: 4865, clicks: 973, revenue: 17680 },
  { date: "2024-01-07", sent: 12300, opens: 4305, clicks: 861, revenue: 15920 },
  { date: "2024-01-08", sent: 16800, opens: 5880, clicks: 1176, revenue: 23450 },
  { date: "2024-01-09", sent: 14200, opens: 4970, clicks: 994, revenue: 18340 },
  { date: "2024-01-10", sent: 15600, opens: 5460, clicks: 1092, revenue: 21230 },
  { date: "2024-01-11", sent: 13400, opens: 4690, clicks: 938, revenue: 17120 },
  { date: "2024-01-12", sent: 14800, opens: 5180, clicks: 1036, revenue: 19680 },
  { date: "2024-01-13", sent: 12900, opens: 4515, clicks: 903, revenue: 16450 },
  { date: "2024-01-14", sent: 15900, opens: 5565, clicks: 1113, revenue: 22340 },
  { date: "2024-01-15", sent: 17200, opens: 6020, clicks: 1204, revenue: 24890 },
];

export const calculateMetrics = (data: Campaign | Flow) => {
  const delivered = data.delivered;
  const openRate = ((data.uniqueOpens / delivered) * 100).toFixed(2);
  const clickRate = ((data.uniqueClicks / delivered) * 100).toFixed(2);
  const ctor = ((data.uniqueClicks / data.uniqueOpens) * 100).toFixed(2);
  const bounceRate = ((data.bounces / data.sent) * 100).toFixed(2);
  const rpr = (data.revenue / delivered).toFixed(2);
  const rpm = ((data.revenue / delivered) * 1000).toFixed(2);
  
  return {
    openRate,
    clickRate,
    ctor,
    bounceRate,
    rpr,
    rpm,
  };
};

export const aggregateMetrics = () => {
  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.delivered, 0);
  const totalOpens = mockCampaigns.reduce((sum, c) => sum + c.uniqueOpens, 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.uniqueClicks, 0);
  const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalBounces = mockCampaigns.reduce((sum, c) => sum + c.bounces, 0);
  const totalSpam = mockCampaigns.reduce((sum, c) => sum + c.spam, 0);
  const totalUnsubscribes = mockCampaigns.reduce((sum, c) => sum + c.unsubscribes, 0);

  return {
    totalRevenue,
    openRate: ((totalOpens / totalDelivered) * 100).toFixed(1),
    clickRate: ((totalClicks / totalDelivered) * 100).toFixed(1),
    bounceRate: ((totalBounces / totalSent) * 100).toFixed(2),
    spamRate: ((totalSpam / totalDelivered) * 100).toFixed(3),
    unsubRate: ((totalUnsubscribes / totalDelivered) * 100).toFixed(2),
  };
};
