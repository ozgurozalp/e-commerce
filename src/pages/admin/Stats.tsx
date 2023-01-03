import AdminLayout from '../../layouts/AdminLayout';
import { useEffect, useState } from 'react';
import { OrderStatus } from '../../types/altogic';
import { capitalize, moneyFormat } from '../../helpers';
import { BiStats, GiTakeMyMoney } from 'react-icons/all';
import { OrderService } from '../../services';
import { Link } from 'react-router-dom';

type Stats = {
	[key in OrderStatus]?: number;
};

export default function Stats() {
	const [stats, setStats] = useState<Stats>({});
	const [totalSales, setTotalSales] = useState<number>();

	useEffect(() => {
		getTotalSales().catch(console.error);
		getStats().catch(console.error);
	}, []);

	async function getStats() {
		const { data, errors } = await OrderService.getStats();
		if (errors) {
			return location.reload();
		}
		// @ts-ignore
		const stats = data?.reduce((acc, curr) => {
			acc[curr.groupby.group] = curr.count;
			return acc;
		}, {}) as Stats;

		setStats(stats);
	}
	async function getTotalSales() {
		const { data, errors } = await OrderService.getTotalSalesByStatus('completed');
		if (errors) {
			return location.reload();
		}
		// @ts-ignore
		setTotalSales(data[0].total);
	}
	return (
		<AdminLayout title="Dashboard">
			<section>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-4 sm:px-0">
					{totalSales && (
						<article className="group cursor-pointer hover:bg-gray-50 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
							<span className="rounded-full bg-blue-100 p-3 text-blue-600">
								<GiTakeMyMoney size={25} />
							</span>

							<div>
								<p className="text-2xl font-medium tabular-nums text-gray-900">
									{moneyFormat(totalSales)}
								</p>
								<Link
									to="/admin/orders"
									className="text-sm text-gray-500 underline-offset-4 group-hover:text-indigo-700 group-hover:underline"
								>
									Total sales
								</Link>
							</div>
						</article>
					)}

					{Object.entries(stats).map(([status, count], index) => (
						<article
							key={index}
							className="group cursor-pointer hover:bg-gray-50 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6"
						>
							<span className="rounded-full bg-blue-100 p-3 text-blue-600">
								<BiStats size={25} />
							</span>

							<div>
								<p className="text-2xl font-medium tabular-nums text-gray-900">{count}</p>

								<Link
									to="/admin/orders"
									className="text-sm text-gray-500 underline-offset-4 group-hover:text-indigo-700 group-hover:underline"
								>
									{capitalize(status)} orders
								</Link>
							</div>
						</article>
					))}
				</div>
			</section>
		</AdminLayout>
	);
}
