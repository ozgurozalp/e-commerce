import { AiOutlineClose } from 'react-icons/all';
import useCartStore from '../store/cart';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moneyFormat, { cn } from '../helpers';
import Button from '../components/ui/Button';
import { Player } from '@lottiefiles/react-lottie-player';
import { Cart } from '../types/altogic';
import { useState } from 'react';
import CartService from '../services/CartService';
import altogic from '../libs/altogic';

export default function ShoppingCart() {
	const { items, totalAmount } = useCartStore();
	const [loading, setLoading] = useState(false);

	async function checkout() {
		setLoading(true);

		const data = items.reduce((acc, curr, index) => {
			acc[`product_${index + 1}_price`] = curr.product.stripePriceId;
			acc[`product_${index + 1}_quantity`] = curr.quantity;
			acc[`product_${index + 1}_altogic_id`] = curr.product._id;
			return acc;
		}, {} as any);
        
		const { data: dataFromApi, errors } = await altogic.endpoint.post('/checkout', data);
		setLoading(false);
		if (errors) {
			toast.error('Something went wrong, please try again');
		} else {
			console.log(dataFromApi);
			// @ts-ignore
			location.replace(dataFromApi.url);
		}
	}

	return (
		<div className="bg-white">
			<div className="container mx-auto pt-5 pb-24 px-4 sm:px-6 lg:px-4">
				<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
				<form className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
					<section
						aria-labelledby="cart-heading"
						className={cn(items.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12')}
					>
						<h2 id="cart-heading" className="sr-only">
							Items in your shopping cart
						</h2>

						{items.length === 0 ? (
							<div className="text-center text-xl flex flex-col gap-4 items-center justify-center col-span-12">
								<div className="text-center space-y-4 p-4 text-xl">
									<Player
										autoplay
										loop
										src="/empty-cart.json"
										style={{ height: '300px', width: '300px' }}
									/>
									<p className="text-3xl">Your cart is empty</p>
								</div>
								<Button variant="white" as="link" href="/">
									Back to home
								</Button>
							</div>
						) : (
							<ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
								{items.map(item => (
									<CartProductItem key={item._id} item={item} />
								))}
							</ul>
						)}
					</section>

					{items.length > 0 ? (
						<section
							aria-labelledby="summary-heading"
							className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
						>
							<h2 id="summary-heading" className="text-lg font-medium text-gray-900">
								Order summary
							</h2>

							<dl className="mt-6 space-y-4">
								<div className="border-gray-200 pt-4 flex items-center justify-between">
									<dt className="text-base font-medium text-gray-900">Order total</dt>
									<dd className="text-base font-medium text-gray-900">{moneyFormat(totalAmount)}</dd>
								</div>
							</dl>

							<div className="mt-6">
								<Button loading={loading} type="button" onClick={checkout} full>
									Checkout
								</Button>
							</div>
						</section>
					) : undefined}
				</form>
			</div>
		</div>
	);
}

function CartProductItem({ item }: { item: Cart }) {
	const { removeProduct } = useCartStore();
	const [removing, setRemoving] = useState(false);
	async function removeItem() {
		try {
			setRemoving(true);
			await CartService.removeCartItem(item._id);
			removeProduct(item);
			toast.success('Product removed successfully');
		} catch (error) {
			console.log(error);
			toast.success('Something went wrong, please try again.');
		} finally {
			setRemoving(false);
		}
	}
	return (
		<li key={item._id} className="flex py-6 sm:py-10">
			<Link to={`/product/${item.product._id}`} className="flex-shrink-0">
				<img
					src={item.product.coverURL}
					alt={item.product.name}
					className="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48"
				/>
			</Link>

			<div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
				<div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
					<div>
						<div className="flex justify-between">
							<h3 className="text-lg">
								<Link
									to={`/product/${item.product._id}`}
									className="font-medium text-gray-700 hover:text-gray-800"
								>
									{item.product.name}
								</Link>
							</h3>
						</div>
						<div className="text-gray-600">
							<h4>{item.product.description}</h4>
						</div>
						<p className="mt-1 text-sm font-medium text-gray-900">
							{moneyFormat(item.product.price)} x {item.quantity}
						</p>
					</div>

					<div className="mt-4 sm:mt-0 sm:pr-9">
						<div className="absolute top-0 right-0">
							<button
								onClick={removeItem}
								type="button"
								className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
							>
								<span className="sr-only">Remove</span>
								<AiOutlineClose className="h-5 w-5" aria-hidden="true" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
}
