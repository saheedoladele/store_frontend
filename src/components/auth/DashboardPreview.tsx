import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const salesData = [
  { month: 'Jan', sales: 12000 },
  { month: 'Feb', sales: 15000 },
  { month: 'Mar', sales: 18000 },
  { month: 'Apr', sales: 16000 },
  { month: 'May', sales: 20000 },
  { month: 'Jun', sales: 18937 },
];

const categoryData = [
  { name: 'Smartphones', value: 35, color: '#3b82f6' },
  { name: 'Laptops & PC', value: 30, color: '#8b5cf6' },
  { name: 'Accessories', value: 35, color: '#10b981' },
];

const transactions = [
  { orderId: '#ORD-001', product: 'iPhone 15 Pro', date: '2025-01-15', price: '$1,299', status: 'Paid' },
  { orderId: '#ORD-002', product: 'MacBook Pro', date: '2025-01-14', price: '$2,499', status: 'Pending' },
  { orderId: '#ORD-003', product: 'AirPods Pro', date: '2025-01-13', price: '$249', status: 'Un Paid' },
  { orderId: '#ORD-004', product: 'iPad Air', date: '2025-01-12', price: '$599', status: 'Paid' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
};

export const DashboardPreview: React.FC = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8">
      {/* Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Headline */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Effortlessly manage your team and operations.
          </h2>
          <p className="text-blue-100 text-lg">
            Log in to access your CRM dashboard and manage your team.
          </p>
        </div>

        {/* Dashboard Widgets */}
        <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
          {/* Total Sales */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Sales</div>
              <div className="text-2xl font-bold mb-1">$189,374</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+7% From last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Chat Performance */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Chat Performance</div>
              <div className="text-2xl font-bold">00:01:30</div>
            </CardContent>
          </Card>

          {/* Sales Overview */}
          <Card className="bg-white/95 backdrop-blur-sm col-span-2">
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-3">Sales Overview</div>
              <ChartContainer config={chartConfig} className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Profit</div>
              <div className="text-2xl font-bold mb-1">$25,684</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5% From last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Sales Categories */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-3">Sales Categories</div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-2">
                Total Sales 6,248 Units
              </div>
            </CardContent>
          </Card>

          {/* Product Transaction */}
          <Card className="bg-white/95 backdrop-blur-sm col-span-2">
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-3">Product Transaction</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-2">Order ID</th>
                      <th className="text-left py-2 px-2">Product Name</th>
                      <th className="text-left py-2 px-2">Order Date</th>
                      <th className="text-left py-2 px-2">Total Price</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">{transaction.orderId}</td>
                        <td className="py-2 px-2">{transaction.product}</td>
                        <td className="py-2 px-2">{transaction.date}</td>
                        <td className="py-2 px-2">{transaction.price}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            transaction.status === 'Paid' 
                              ? 'bg-green-100 text-green-700' 
                              : transaction.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <button className="text-blue-600 hover:underline text-xs">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
