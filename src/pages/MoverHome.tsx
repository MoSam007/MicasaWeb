// pages/MoverHome.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import MainLayout from '../components/MainLayout';
import MoverNavigation from '../navigation/MoverNavigation';

const MoverHome: React.FC = () => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Jobs',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <MainLayout navigation={<MoverNavigation />}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Current Orders</h3>
            <p className="text-3xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Completed This Month</h3>
            <p className="text-3xl font-bold text-blue-600">23</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-purple-600">$2,450</p>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Current Orders */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Current Orders</h2>
          <div className="divide-y">
            {/* Order items */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MoverHome;