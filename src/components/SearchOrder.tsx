import { FaSearch } from 'react-icons/all';
import Button from './ui/Button';
import { useEffect, useRef, useState } from 'react';
import { OrderService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import Input from './ui/Input';
import { Order } from '../types/altogic';
import { Link } from 'react-router-dom';
let timeout: number;

export default function SearchOrder() {
	const [result, setResult] = useState<Order[] | null>(null);
	const input = useRef<HTMLInputElement>(null);

	function onChangeHandler() {
		if (!input.current) return;
		const value = input.current?.value;
		clearTimeout(timeout);
		if (value.trim().length === 0) return setResult(null);
		timeout = window.setTimeout(() => search(value), 500);
	}

	async function search(query: string) {
		try {
			const result = await OrderService.searchOrder(query);
			setResult(result);
		} catch (e) {
			console.log(e);
			setResult([]);
		}
	}

	return (
		<div className="flex items-center gap-3 h-12 w-full">
			<div className="flex-1">
				<div className="relative group">
					<Input
						onChange={onChangeHandler}
						ref={input}
						className="py-2.5"
						placeholder="Type any customer name or email or order number to search"
					/>
					<AnimatePresence>
						{result && (
							<motion.div
								initial={{ y: -1, opacity: 0 }}
								animate={{ y: 5, opacity: 1 }}
								exit={{ y: -1, opacity: 0 }}
								transition={{ type: 'spring' }}
								className="hidden z-50 group-focus-within:block origin-top-left shadow min-h-[30px] absolute bg-white top-full rounded py-2 left-0 right-0 border"
							>
								<ul className="grid gap-1">
									{Array.isArray(result) && result.length > 0 ? (
										result?.map(order => (
											<li
												key={order._id}
												className="hover:bg-gray-100 transition h-[40px] relative"
											>
												<Link
													className="block absolute inset-0 flex items-center px-2  gap-1"
													to={`/admin/orders/${order._id}?orderNumber=${order.orderNumber}`}
												>
													<strong>#{order.orderNumber.toString().padStart(6, '0')}</strong>
													<span>-</span>
													<span>{order.user.name}</span>
												</Link>
											</li>
										))
									) : (
										<li className="hover:bg-gray-100 transition px-2 justify-center font-bold h-[40px] relative flex items-center">
											No orders found
										</li>
									)}
								</ul>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
